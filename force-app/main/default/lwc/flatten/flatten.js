const flatten = (obj) => {
    const flattenedObject = {};
    traverseAndFlatten(obj, flattenedObject);
    return flattenedObject;
}

const traverseAndFlatten = (currentNode, target, flattenedKey) => {
    for (const key in currentNode) {
        if (currentNode.hasOwnProperty(key)) {
            let newKey;
            if (flattenedKey === undefined) {
                newKey = key;
            }
            else {
                newKey = flattenedKey + "." + key;
            }
            const value = currentNode[key];
            if (typeof value === "object") {
                traverseAndFlatten(value, target, newKey);
            }
            else {
                target[newKey] = value;
            }
        }
    }
}

export default flatten;