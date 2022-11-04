import EventEmitter from "events";
import { writable } from "svelte/store";

const object_equal = (a, b) => {
    if (!a || !b) return false;
    for (const key in a) {
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
};

export const makeStore = (t, idField = "UAR") => {
    const _e = new EventEmitter();
    const _s = writable(t);
    const { subscribe, set, update } = _s;

    const push = (media, emit = true) => _s.update(prev => {
        if (!prev) return { [media[idField]]: media };

        if (object_equal(prev[media[idField]], media)) {
            return;
        }

        emit && _e.emit("push", media);
        prev[media[idField]] = media;
        return prev;
    });
    return {
        subscribe,
        set,
        update,
        push,
        on: _e.on.bind(_e)
    };
};
