import { writable, get } from "svelte/store";
import EventEmitter from "events";

const object_equal = (a, b) => {
    if (!a || !b) return false;
    for (const key in a) {
        if (typeof a[key] === "object") {
            if (!object_equal(a[key], b[key])) {
                return false;
            }
        } else if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
};

export const makeStore = (t, idField = "UAR") => {
    const _e = new EventEmitter();
    const _s = writable(t);
    const { subscribe, set, update } = _s;

    const push = (media, emit = true) => {
        const prev = get(_s);
        if (!prev) return _s.set({ [media[idField]]: media });
        if (object_equal(prev[media[idField]], media)) return;

        emit && _e.emit("push", media);
        prev[media[idField]] = media;
        return _s.set(prev)
    };

    return {
        subscribe,
        set,
        update,
        push,
        on: _e.on.bind(_e)
    };
};
