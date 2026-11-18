
let newId = 1;
const MAX_TICKETS = 1000
export function addTicket(title,priority ) {
    if(title.length < 3 || title.length > 80)
        throw new Error("Tytul nie moze miec mnie niz 3 lub wiecej niz 80 znaków")
    if(newId > MAX_TICKETS)
        throw new Error("Osiagnieto limit możliwych ticketów")

    const idS = String(newId++)
    if(idS.length === 0 ||  idS.length > 100)
        throw new Error("ID musi mieć od 1 do 100 znaków")
    return { id: idS, title, priority, status: "new"}   
}
export function updateTicket(tickets, id, status) { 
    return tickets.map(t =>(t.id === id) ? {...t, status} : t); 
}
export function filterTicket(tickets, status) {
    if(status == 'all') return tickets;
    return tickets.filter(t => t.status === status);
}
 // po imporcie id wieksze od najwiekszego wczesniejszego
 // nie kumam tego - to z ai
export function resetId(tickets) {
    let max = 0
    for (const t of tickets) {
        if (Number(t.id) > max) max = Number(t.id)
    }
    newId = max + 1
}

export function importJSON(text) {
    let data
    try {
        data = JSON.parse(text)
    } catch (e) {
        throw new Error("Zle dane importu.")
    }

    if (!Array.isArray(data)) { return false }
    if (data.length > MAX_TICKETS) { return false }

    const ids = []
    for (const t of data) {
        if (t === null || typeof t !== "object") { return false }
        if (typeof t.id !== "string" || t.id.length < 1 || t.id.length > 100) { return false }
        if (ids.includes(t.id)) { return false }
        ids.push(t.id)
        if (typeof t.title !== "string" || t.title.length < 3 || t.title.length > 80) { return false }
        if (!["low", "medium", "high"].includes(t.priority)) { return false }
        if (!["new", "doing", "done"].includes(t.status)) { return false }
    }

    return data
}

export function clearTickets() {
    newId = 1
    return []
}
