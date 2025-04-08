// Date in dd/mm/yy hh:mm:ss 

export const formatMessageTime = (date) => {
    return new Date(date).toLocaleString("en-us", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};
