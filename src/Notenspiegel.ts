import Entry, {ModulTypes} from "./Entry";
import {log} from "./Logger";

function isIterable(obj) {
    // checks for null and undefined
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}

export default class Notenspiegel {
    private readonly _besondereEintrage: Array<Entry>;
    private readonly _entries: Array<Entry>;
    private readonly _all: Array<Entry>;


    constructor(data: Array<Record<string, string| null>>) {
        if (!isIterable(data)) {
            throw new Error("Data is not iterable");
        }
        this._besondereEintrage = Entry.getModules(data, ModulTypes.special);
        this._entries = Entry.getModules(data);
        this._all = Entry.getModules(data, ModulTypes.all);
    }

    public findDifferences(old: Array<Record<string, any>>): Array<Entry> {
        const res: Array<Entry> = [];
        for (const allElement of this._all) {
            const oldEl = old.filter(el => el._id === allElement.id)[0];
            if (!oldEl) {
                if (!isNaN(allElement.id)) {
                    res.push(allElement);
                }
            }else if (JSON.stringify(oldEl) !== JSON.stringify(allElement)) {
                res.push(allElement)
            }
        }
        return res;
    }

    get length(): number {
        return this._all.length;
    }

    get besondereEintrage(): Array<Entry> {
        return this._besondereEintrage;
    }

    get entries(): Array<Entry> {
        return this._entries;
    }

    get all(): Array<Entry> {
        return this._all;
    }
}
