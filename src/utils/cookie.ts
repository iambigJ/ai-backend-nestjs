export const getCookie = (cookies: string | undefined, key: string) => {
    if (!cookies) {
        return null;
    }
    const values = cookies.split('; ');
    for (const cookie of values) {
        const [name, value] = cookie.split('=');
        if (name === key) {
            return value;
        }
        return ''; // not found
    }
};
