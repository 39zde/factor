export type AddDataArgs = {
	keys: string[];
	rows: string[];
	db: IDBDatabase;
};

export type DateInput = "YYYYMMDD" | "YYYY-MM-DD hh:mm:ss"
