export interface Contact {
    id: string;
    tags: Array< {
            name: string,
        }
        >;
    phones: Array< {
            type: | "CELL"
            | "BUSINESS"
            | "HOME"
            ,
            number: number,
        }
        >;
    name: string;
}
