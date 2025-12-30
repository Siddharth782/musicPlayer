export function getQueryParams(url) {
    const result = {};

    if(!url) return null;

    const queryString = url.split('?')[1];
    if (!queryString) return result;

    const params = queryString.split('&');

    for (let param of params) {
        const [k, v] = param.split('=');
        if(k) result[k] = v ? decodeURIComponent(v) : '';
    }

    return result;
}