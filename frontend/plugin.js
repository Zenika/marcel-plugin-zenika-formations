class ZenikaFormations extends Marcel.Plugin {
    constructor() {
        super({
            defaultProps: {
                agency: "",
                titleMessage: "Next formations in {agency}",
                displayTime: 1,
                dualpane: true,                
                locale: "fr"
            },
        })

        this.formationList = document.getElementById("content")
        this.sessionList = []
        this.selectedIndex = 0
        this.urlFormationList = "http://localhost:8080/api/public/planned-sessions"
        this.intervalID = null
    }

    getAllSessionsInAgency(agency) {
        return fetch(this.urlFormationList)
            .then(response => response.json())
            .then(formJson => formJson.plannedSessions.filter(e => e.agencyName === agency))
    }

    displayAllFuturSessions(agency, dualpane) {
        this.getAllSessionsInAgency(agency)
            .then(sessions => {
                this.sessionList = sessions
                this.displayList()
                if (dualpane)
                    this.displaySessionDetail()
            })
    }

    displaySessionDetail() {
        const [title, subtitle, trainer, date, duration, summary] = [
            document.getElementById("title"),
            document.getElementById("subtitle"),
            document.getElementById("trainer"),
            document.getElementById("date"),
            document.getElementById("duration"),
            document.getElementById("summary")
        ]
        const session = this.sessionList[this.selectedIndex]
        title.innerText = session.trainingTitle
        subtitle.innerText = session.trainingSubTitle
        if(session.trainerFirstName && session.trainerLastName) {
            trainer.innerText = "Par " + session.trainerFirstName + " " + session.trainerLastName + " "
        }
        const endDate = moment(session.startDate, "YYYY-MM-DD").format("LL")
        date.innerText = "le " + endDate + ". "

        duration.innerText = "Dure: " + session.trainingDays + (session.trainingDays > 1 ? " jours." : "jour.")
        
        // TODO: Remove the HTML in the description and use innerText
        summary.innerHTML = session.training.description
    }

    displayList() {
        this.formationList.innerHTML = ""
        this.sessionList.forEach((formation, index) => {
            const item = document.createElement("div")
            item.classList.add("flex-container")
            item.classList.add("list-item")
            if (index === 0) {
                item.classList.add("top", "selected")
            }

            const name = document.createElement("div")
            name.classList.add("name-info")
            const date = document.createElement("div")
            const startDate = moment(formation.startDate, "YYYY-MM-DD").format("dddd DD MMMM")
            name.innerText = formation.trainingTitle
            date.classList.add("date-info")
            date.innerText = startDate
            item.appendChild(name)
            item.appendChild(date)
            this.formationList.appendChild(item)
        })
    }

    updateSelection() {
        if (this.sessionList !== undefined && this.sessionList.length !== 0) {
            if (this.selectedIndex === this.sessionList.length - 1) {
                this.selectedIndex = 0
            } else {
                this.selectedIndex += 1
            }
            this.displaySessionDetail()
            this.updateSelectionColor()
        }
    }

    removeSelectionColor() {
        const prevIndex = this.selectedIndex == 0 ? this.formationList.children.length-1 : this.selectedIndex-1
        const prevItem = this.formationList.children[prevIndex]
        prevItem.classList.remove("selected")
    }

    updateSelectionColor() {
        this.removeSelectionColor()
        const item = this.formationList.children[this.selectedIndex]
        item.classList.add("selected")
    }

    propsDidChange(prevProps) {
        const {
            agency,
            titleMessage,
            displayTime,
            locale,
            dualpane,
            stylevars
        } = this.props

        if (agency !== prevProps.agency) {
            this.displayAllFuturSessions(agency, dualpane)
        }
        if (locale !== prevProps.locale) {
            moment.locale(locale)
        }
    }

    render() {
        const {
            agency,
            titleMessage,
            displayTime,
            locale,
            dualpane,
            stylevars
        } = this.props
        const listTitle = document.getElementById("list-title")
        listTitle.innerHTML = titleMessage.replace("{agency}", agency)

        if (this.intervalID !== null) {
            window.clearInterval(this.intervalID)
        }
        if (dualpane) {
            document.getElementById("right-pane").style.display = "block"
            this.intervalID = window.setInterval(() => this.updateSelection(), displayTime * 1000)
        } else {
            document.getElementById("right-pane").style.display = "none"
        }
    }
}

const instance = new ZenikaFormations()

Marcel.Debug.changeProps({
    agency: "Nantes",
    titleMessage: "Next formation in {agency}",
    displayTime: 5,
    locale: "fr",
    dualpane: true,
    stylevars: {
        "background-color": "#FFFFFF",
        "primary-color": "rgb(202, 40, 40)", 
        "secondary-color": "rgb(240, 240, 240)", 
        "font-family": "Roboto"
    }
})