import { User } from 'firebase/auth';

interface FirestoreStart {
    projectId: string;
    databaseId: string;
}

// Helper to convert JS Object to Firestore REST JSON
// This is a simplified version handling common types.
export function toFirestoreValue(value: any): any {
    if (value === null) return { nullValue: null };
    if (value === undefined) return null; // Should be handled by caller
    if (typeof value === 'boolean') return { booleanValue: value };
    if (typeof value === 'number') {
        if (Number.isInteger(value)) return { integerValue: value.toString() };
        return { doubleValue: value };
    }
    if (typeof value === 'string') return { stringValue: value };
    if (Array.isArray(value)) {
        return { arrayValue: { values: value.map(toFirestoreValue).filter(v => v !== null) } };
    }
    if (value instanceof Date) return { timestampValue: value.toISOString() };
    if (typeof value === 'object' && value !== null) {
        // Special Handling for serverTimestamp equivalent in REST?
        // REST API doesn't support serverTimestamp sentinel easily without transformation.
        // For now, we use client-side timestamp or omit.
        // If updating specific fields (`updateMask`), we need to be careful.

        // Handle nested maps
        const fields: any = {};
        for (const k in value) {
            const v = toFirestoreValue(value[k]);
            if (v !== null) fields[k] = v;
        }
        return { mapValue: { fields } };
    }
    return { stringValue: String(value) };
}

export function fromFirestoreValue(value: any): any {
    if (value.nullValue !== undefined) return null;
    if (value.booleanValue !== undefined) return value.booleanValue;
    if (value.integerValue !== undefined) return parseInt(value.integerValue, 10);
    if (value.doubleValue !== undefined) return parseFloat(value.doubleValue);
    if (value.stringValue !== undefined) return value.stringValue;
    if (value.timestampValue !== undefined) return new Date(value.timestampValue); // Or keep string?
    if (value.arrayValue !== undefined) {
        return (value.arrayValue.values || []).map(fromFirestoreValue);
    }
    if (value.mapValue !== undefined) {
        const obj: any = {};
        const fields = value.mapValue.fields || {};
        for (const k in fields) {
            obj[k] = fromFirestoreValue(fields[k]);
        }
        return obj;
    }
    return undefined;
}

// Convert Firestore Document (REST) to JS Object
export function fromFirestoreDoc(doc: any) {
    if (!doc || !doc.fields) return null;
    const obj: any = {};
    // ID handling? The document name is "projects/.../documents/users/UID"
    // We might want to extract ID.
    if (doc.name) {
        const parts = doc.name.split('/');
        obj.id = parts[parts.length - 1];
    }
    for (const k in doc.fields) {
        obj[k] = fromFirestoreValue(doc.fields[k]);
    }
    return obj;
}


export async function proxyGetDoc(path: string, user: User) {
    const token = await user.getIdToken();
    const res = await fetch('/api/proxy/firestore', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            path,
            method: 'GET'
        })
    });

    if (!res.ok) {
        if (res.status === 404) return { exists: () => false };
        throw new Error(`Proxy Get Failed: ${res.statusText}`);
    }

    const data = await res.json();
    // Firestore REST returns error 404 if not found?
    // "error": { "code": 404, "message": "No document found...", "status": "NOT_FOUND" }
    // Handled by res.ok check above?
    // Actually REST APIs sometimes return error object.
    if (data.error) {
        if (data.error.code === 404) return { exists: () => false };
        throw new Error(`Proxy Get Error: ${data.error.message}`);
    }

    const docData = fromFirestoreDoc(data);
    return {
        exists: () => true,
        data: () => docData,
        id: docData.id
    };
}

export async function proxySetDoc(path: string, data: any, user: User, merge: boolean = false) {
    const token = await user.getIdToken();

    // For setDoc with merge=true, we usually use PATCH with updateMask
    // For overwrite, we can use PATCH without mask or simply commit?
    // Firestore REST uses `patch` method for updates/sets.

    // Construct Firestore document object: { fields: { ... } }
    const fsData = { fields: {} as any };
    for (const k in data) {
        const v = toFirestoreValue(data[k]);
        if (v !== null) fsData.fields[k] = v;
    }

    const queryParams: any = {};
    if (merge) {
        // If merge, we need `updateMask.fieldPaths` for every field we want to update?
        // Or just passing fields implies update?
        // If document doesn't exist, PATCH creates it? Yes.
        // But if we want Set(Merge), we should NOT set updateMask?
        // Actually, if we use PATCH, it updates only specified fields if updateMask is present.
        // If no updateMask is present, it replaces the document? No, that's commit/put?

        // Wait, Firestore REST `patch`:
        // "Update the document. If the document does not exist, it will be created..."
        // "If the mask is not set, the entire document will be replaced." -> Overwrite (Set without merge)
        // "If the mask is set, only the fields listed in the mask will be updated." -> Update (Set with merge)

        // So for `setDoc(..., { merge: true })`:
        // We need to list all fields in `updateMask.fieldPaths`.

        // Simplified approach: just replace for new user creation (which is our main use case).
        // For updates, we usually use `updateDoc`.

        // Let's implement minimal logic for `saveUser`.
        // `saveUser` does `setDoc` (overwrite/create) for new user. -> No mask needed.
        // `saveUser` does `updateDoc` for existing. -> Mask needed.
    }

    // But wait, `saveUser` logic:
    // New user -> setDoc (no merge, full overwrite with initial data).
    // Existing -> updateDoc (partial update).

    // Let's handle explicit `isUpdate` flag or something.
    // Or just use `patch` method.

    // If merge logic is complex, let's keep it simple for now as we control `saveUser`.

    const body: any = {
        path,
        method: 'PATCH', // REST API uses PATCH for document writes
        data: fsData
    };

    // Handling updateMask for `updateDoc` equivalent
    if (merge) {
        // Construct updateMask
        const fieldPaths = Object.keys(data);
        // Format: ?updateMask.fieldPaths=field1&updateMask.fieldPaths=field2...
        // queryParams object handling in route.ts
        queryParams['updateMask.fieldPaths'] = fieldPaths;
    }

    const res = await fetch('/api/proxy/firestore', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            ...body,
            queryParams: merge ? queryParams : undefined
        })
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Proxy Set Failed: ${errorData.error?.message || res.statusText}`);
    }

    return await res.json();
}

export async function proxyQuery(collectionPath: string, whereField: string, whereOp: string, whereValue: any, user: User) {
    const token = await user.getIdToken();

    // RunQuery (POST)
    // https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents:runQuery

    // Construct StructuredQuery
    const structuredQuery = {
        from: [{ collectionId: collectionPath }],
        where: {
            fieldFilter: {
                field: { fieldPath: whereField },
                op: 'EQUAL', // mapped from whereOp '=='
                value: toFirestoreValue(whereValue)
            }
        },
        limit: 1 // We only check existence usually
    };

    const res = await fetch('/api/proxy/firestore', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            path: ':runQuery', // Special path for query
            method: 'POST',
            data: { structuredQuery }
        })
    });

    if (!res.ok) {
        throw new Error(`Proxy Query Failed: ${res.statusText}`);
    }

    const data = await res.json(); // Array of results or empty
    // each item has `document` or `readTime` (if empty?)
    // data is array of objects like { document: { ... }, readTime: ... }

    // If no match, it might return array with just timestamps or empty array?
    // "If no documents match, the response will be empty (or contain only read time if configured)"

    if (!Array.isArray(data)) return { empty: true, docs: [] }; // Should act as snapshot.docs

    // filter out items without `document`
    const docs = data.filter((item: any) => item.document).map((item: any) => ({
        id: item.document.name.split('/').pop(),
        data: () => fromFirestoreDoc(item.document)
    }));

    return {
        empty: docs.length === 0,
        docs
    };
}
