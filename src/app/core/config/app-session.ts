
export class AppSession {
    
    // function for session storage
    public static setSessionStorage(key: string, value: any): void {
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    public static getSessionStorage(key: string): any {
        return JSON.parse(sessionStorage.getItem(key));
    }

    public static clearSessionStorage(key: string): void {
        sessionStorage.removeItem(key);
    }

    // function for local storage
    public static setLocalStorage(key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    public static getLocalStorage(key: string): any {
        return JSON.parse(localStorage.getItem(key));
    }

    public static clearLocalStorage(key: string): void {
        localStorage.removeItem(key);
    }

}