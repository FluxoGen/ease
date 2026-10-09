/** A list of rows. On the website each row is its own card; in the app the rows share one rounded surface with dividers. */
export const GROUPED_LIST = 'flex flex-col gap-2 app:gap-0 app:overflow-hidden app:rounded-[24px] app:border app:border-line app:bg-card';
/** A row inside GROUPED_LIST (app only; the website keeps its own card styling on the row itself). */
export const GROUPED_ROW = 'app:rounded-none app:border-0 app:border-b app:border-line app:bg-transparent app:shadow-none app:last:border-b-0 app:active:scale-100';
