/**
 * Enum über den Status eines Eintrags
 */
enum Bestehen {
    nichts,
    bestanden,
    durchgefallen
}

export default abstract class Entry {
    protected constructor(data: Record<string, string | null>) {
        this._id = parseInt(data['#']);
        if (isNaN(this._id) || data['#']?.match(/^[0-9]0+$/)) {
            this._special = true
        }
        this._note = parseFloat(data.Note?.replace(",", ".").replace("*", "").trim());
        this._name = data['Prüfungstext'];
        if (data['Prüfungsdatum']) {
            const dateParts = data['Prüfungsdatum'].split(".");
            this._datum = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
        }
        this._vorlauefig = !!data.Note?.match(/\*/);
        if (this._note <= 4 || data.Status) {
            this._status = Bestehen.bestanden;
        } else if (data.Status === null) {
            this._status = Bestehen.nichts;
        } else {
            this._status = Bestehen.durchgefallen;
        }
        this._ects = parseFloat(data.ECTS?.replace(",", "."));
    }

    /**
     * Markiert besondere Einträge
     * @private
     */
    private readonly _special: boolean = false;

    /**
     * ID des Eintrags
     * @private
     */
    private readonly _id: number;

    /**
     * Name des Eintrags
     * @private
     */
    private readonly _name: string;

    /**
     * Datum der Prüfung
     * @private
     */
    private readonly _datum: Date;

    /**
     * Note des Eintrags
     * @private
     */
    private readonly _note: number;

    /**
     * Gibt an, ob die Note vorläufig ist
     * @private
     */
    private readonly _vorlauefig: boolean;

    /**
     * Status des Eintrags
     * @private
     */
    private readonly _status: Bestehen

    /**
     * Erarbeitete ECTS des Eintrags
     * @private
     */
    private readonly _ects: number

    public static getSpecialEntries(ar: Array<Record<string, string | null>>): Array<Entry> {
        const special = [];
        for (const datum of ar) {
            const p = Entry.createEntry(datum);
            if (p.special) {
                special.push(p);
            }
        }
        return special
    }

    public static createEntry(data: Record<string, string | null>): Entry {
        return data.isExam ? new Pruefung(data) : new Modul(data);
    }

    public static getModules(array: Array<Record<string, string | null>>): Array<Entry> {
        const res = [];
        let lastModule: Modul = null;
        for (let i = 0; i < array.length; i++) {
            const p = Entry.createEntry(array[i]);
            if (!p.special) {
                if (p instanceof Modul) {
                    lastModule = p;
                    res.push(p);
                } else {
                    if (lastModule) {
                        lastModule.addEntry(p);
                    } else {
                        res.push(p);
                    }
                }
            }
        }
        return res;
    }


    get special(): boolean {
        return this._special;
    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get datum(): Date {
        return this._datum;
    }

    get note(): number {
        return this._note;
    }

    get vorlauefig(): boolean {
        return this._vorlauefig;
    }

    get status(): Bestehen {
        return this._status;
    }

    get ects(): number {
        return this._ects;
    }
}


export class Modul extends Entry {
    /**
     * Die Einträge eines Modules
     * @private
     */
    private _entries: Array<Entry> = [];

    constructor(data: Record<string, string | null>) {
        super(data);
    }

    public addEntry(entry: Entry) {
        this._entries.push(entry);
    }


    get entries(): Array<Entry> {
        return this._entries;
    }
}

export class Pruefung extends Entry {

    /**
     * Semester der Prüfung
     * @private
     */
    private readonly _semester: string;

    /**
     * Erreichte Punkte
     * @private
     */
    private readonly _punkte: number | null;

    /**
     * Nummer des Versuchs
     * @private
     */
    private readonly _versuch: number

    constructor(data: Record<string, string | null>) {
        super(data);
        this._semester = data.Semester;
        this._punkte = parseFloat(data.Punkte) || null;
        this._versuch = parseInt(data.Versuch) || null;
    }


    get semester(): string {
        return this._semester;
    }

    get punkte(): number | null {
        return this._punkte;
    }

    get versuch(): number {
        return this._versuch;
    }
}
