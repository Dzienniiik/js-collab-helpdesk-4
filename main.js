import { renderTickets } from './render.js'
import { addTicket, updateTicket, filterTicket, resetId, importJSON } from './tickets.js'

let tickets = []
let currentFilter = 'all'
let isImporting = false

const form = document.querySelector(".helpdeskForm")
const titleInput = document.querySelector(".helpdeskTitle")
const prioritySelect = document.querySelector(".helpdeskPriority")
const filterSelect = document.querySelector(".helpdeskFilter")
const list = document.querySelector(".helpdeskList")
const importBtn = document.querySelector(".helpdeskImport")
const fileInput = document.querySelector(".helpdeskFile")

function saveTickets() {
    localStorage.setItem("tickets", JSON.stringify(tickets))
}

function loadTickets() {
    const text = localStorage.getItem("tickets")
    if (text) {
        try {
            tickets = JSON.parse(text)
        } catch (err) {
            tickets = []
        }
    }
}

// Blokuje (albo odblokowuje) wszystkie inputy, selecty i przyciski na stronie
function setLocked(locked) {
    const elements = document.querySelectorAll("input, select, button")
    for (const el of elements) {
        el.disabled = locked
    }
}

function rerender() {
    renderTickets(list, filterTicket(tickets, currentFilter))
}

// getText to funkcja, która pobiera tekst JSON (z fetch albo z pliku)
async function startImport(getText) {
    if (isImporting) return
    isImporting = true
    setLocked(true)

    try {
        const text = await getText()
        const data = importJSON(text)
        if (data === false) {
            throw new Error("Zle dane importu.")
        }

        const ok = confirm("Zastąpić obecną listę (" + tickets.length + ") zgłoszeniami z importu (" + data.length + ")?")
        if (!ok) return

        tickets = data
        resetId(tickets)
        saveTickets()
        rerender()
    } catch (err) {
        // przy błędzie tickets zostają bez zmian
        alert("Błąd importu: " + err.message)
    } finally {
        isImporting = false
        setLocked(false)
    }
}

async function getTextFromServer() {
    const response = await fetch("./tickets.json")
    if (!response.ok) {
        throw new Error("Nie udało się pobrać tickets.json")
    }
    return await response.text()
}

importBtn.addEventListener("click", () => {
    startImport(getTextFromServer)
})

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0]
    if (!file) return
    fileInput.value = ""

    startImport(async () => {
        return await file.text()
    })
})

form.addEventListener("submit", e => {
    e.preventDefault()
    if (isImporting) return
    try {
        tickets = [...tickets, addTicket(titleInput.value, prioritySelect.value)]
        saveTickets()
        form.reset()
        rerender()
    } catch (err) {
        alert(err.message)
    }
})

list.addEventListener("change", e => {
    if (isImporting) return
    const id = e.target.closest('li').dataset.id
    tickets = updateTicket(tickets, id, e.target.value)
    saveTickets()
    rerender()
})

filterSelect.addEventListener("change", e => {
    currentFilter = e.target.value
    rerender()
})

// Start strony
loadTickets()
resetId(tickets)
rerender()