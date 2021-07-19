import Entry from "./Entry";

function isIterable(obj) {
    // checks for null and undefined
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}

export default class Notenspiegel {
    private readonly besondereEintrage: Array<Entry> = []
    private readonly entries: Array<Entry> = []


    constructor(data: Array<Record<string, string| null>>) {
        if (!isIterable(data)) {
            console.error(data);
            throw new Error("Data is not iterable");
        }
        this.besondereEintrage = Entry.getSpecialEntries(data);
        this.entries = Entry.getModules(data);

        console.log(this.besondereEintrage)
        console.log(this.entries)
    }
}
