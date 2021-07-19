/**
 * Enum über den Status eines Eintrags
 */
enum Bestehen {
    nichts,
    bestanden,
    durchgefallen
}

export default abstract class Entry {
    /**
     * Originale String des Eintrags
     * @private
     */
    private originalString: string;

    /**
     * ID des Eintrags
     * @private
     */
    private id: number;

    /**
     * Name des Eintrags
     * @private
     */
    private name: string;

    /**
     * Note des Eintrags
     * @private
     */
    private note: number;

    /**
     * Gibt an, ob die Note vorläufig ist
     * @private
     */
    private vorlauefig: boolean;

    /**
     * Status des Eintrags
     * @private
     */
    private status: Bestehen
}


export class Modul extends Entry {
    /**
     * Die Einträge eines Modules
     * @private
     */
    private entries: Array<Entry>;
}

export class Pruefung extends Entry {

    /**
     * Semester der Prüfung
     * @private
     */
    private semester: string;

    /**
     * Datum der Prüfung
     * @private
     */
    private datum: Date;

    /**
     * Erreichte Punkte
     * @private
     */
    private punkte: number | string;

    private versuch: number


}
