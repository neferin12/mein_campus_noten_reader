/**
 * Enum über den Status eines Eintrags
 */
export enum Bestehen {
    nichts,
    bestanden,
    durchgefallen
}

/**
 * Enum für die Auswahl, welche Modelle geparst werden sollen
 */
export enum ModulTypes {
    notSpecial,
    special,
    all
}

export default abstract class Entry {
    protected constructor(data: Record<string, string | null>) {
        this._id = parseInt(data['#']);
        if (isNaN(this._id) || data['#']?.match(/^[0-9]0+$/)) {
            this._special = true
        }
        this._note = parseFloat(data.Note?.replace(",", ".").replace("*", "").trim()) || null;
        this._name = data['Prüfungstext'];
        if (data['Prüfungsdatum']) {
            const dateParts = data['Prüfungsdatum'].split(".");
            this._datum = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
        }
        this._vorlauefig = !!data["Note"]?.match(/\*/);
        if ((this._note <= 4 && this._note !== null) || data["Status"] === "bestanden") {
            this._status = Bestehen.bestanden;
        } else if (data["Status"] === null) {
            this._status = Bestehen.nichts;
        } else {
            this._status = Bestehen.durchgefallen;
        }
        this._ects = parseFloat(data["ECTS"]?.replace(",", "."));
        this._punkte = parseFloat(data.Punkte) || null;
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
     * Erreichte Punkte
     * @private
     */
    private readonly _punkte: number | null;

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

    public static createEntry(data: Record<string, string | null>): Entry {
        return data.isExam ? new Pruefung(data) : new Modul(data);
    }

    public static getModules(array: Array<Record<string, string | null>>, special = ModulTypes.notSpecial): Array<Entry> {
        const res = [];
        //Füge besondere hinzu
        if (special !== ModulTypes.notSpecial) {
            for (const datum of array) {
                const p = Entry.createEntry(datum);
                if (p.special) {
                    res.push(p);
                }
            }
        }
        //Füge nicht besondere hinzu
        if (special !== ModulTypes.special) {
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
        }

        return res;
    }

    abstract toHTML(): string;

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

    /**
     * Gibt eine Bewertung für den Eintrag zurück (entweder Punkte, Note, oder den Status)
     * @protected
     */
    protected bewertung(): string {
        if (this._punkte !== null) return this._punkte.toString();
        if (this._note !== null) return this._note.toString();
        switch (this._status) {
            case Bestehen.bestanden:
                return "bestanden";
            case Bestehen.durchgefallen:
                return "nicht bestanden"
            default:
                return "Keine Information"
        }
    }

    /**
     * Gibt je nach Bestehensstatus ein Kreuz oder einen Haken in HTML Format zurück
     * @protected
     */
    protected symbol(): string {
        switch (this._status) {
            case Bestehen.bestanden:
                return '&#9989;';
            case Bestehen.durchgefallen:
                return '&#10060;'
            default:
                return '';
        }
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

    toHTML() {
        let html = `<b>Modul: ${this.name}</b>${this.symbol()}<ul>`;
        for (const entry of this.entries) {
            html += `<li>${entry.toHTML()}</li>`
        }
        html += '</ul>'
        return html;
    }
}

export class Pruefung extends Entry {

    /**
     * Semester der Prüfung
     * @private
     */
    private readonly _semester: string;

    /**
     * Nummer des Versuchs
     * @private
     */
    private readonly _versuch: number

    constructor(data: Record<string, string | null>) {
        super(data);
        this._semester = data.Semester;
        this._versuch = parseInt(data.Versuch) || null;
    }


    get semester(): string {
        return this._semester;
    }

    get versuch(): number {
        return this._versuch;
    }

    toHTML(): string {
        return `<b>${this.name}</b> (${this.id}): <b>${this.bewertung()}</b> ${this.status === Bestehen.bestanden ? ' &#9989;' : (this.status === Bestehen.durchgefallen ? ' &#10060;' : '')}`;
    }
}
