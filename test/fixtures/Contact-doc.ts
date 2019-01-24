export interface Contact {
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
    id: string;
}
