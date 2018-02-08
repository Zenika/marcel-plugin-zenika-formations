class ZenikaFormations extends Marcel.Plugin {
    constructor() {
        super({
            defaultProps: {
                agency: "",
                titleMessage: "Next formations in {agency}",
                displayTime: 1,
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

    displayAllFuturSessions(agency) {
        this.getAllSessionsInAgency(agency)
            .then(sessions => {
                this.sessionList = sessions
                this.displayList()
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
            if (index === this.selectedIndex) {
                item.classList.add("selected")
            }
            if (index === 0) {
                item.classList.add("top")
            }

            const name = document.createElement("div")
            name.style.flex = 1
            const date = document.createElement("div")
            date.style.flex = 1

            const startDate = moment(formation.startDate, "YYYY-MM-DD").format("dddd DD MMMM")
            name.innerText = formation.trainingTitle
            date.classList.add("date-info")
            date.classList.add("text-right")
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
            this.displayList()
            this.displaySessionDetail()
            this.updateSelectionColor()
        }
    }

    changeBGColor(className, color) {
        const el = document.getElementsByClassName(className)
        let fc = "#191919"
        if (tinycolor(color).isDark()) {
            fc = "#f9f9f9"
        }
        
        for(let i=0; i<el.length; i++) {
            el[i].style.backgroundColor = color
            el[i].style.color = fc
        }
    }

    changeFontColor(className, color) {
        const el = document.getElementsByClassName(className)
        for(let i=0; i<el.length; i++) {
            el[i].style.color = color
        }
    }

    updateSelectionColor() {
        /*
        const el = document.getElementsByClassName("selected")
        const sc = tinycolor(this.props.stylevars["secondary-color"])
        let comp = ""
        if(sc.isDark()) {
            comp = sc.lighten(65).toHexString()
        } else {
            comp = sc.darken(65).toHexString()
        }
        
        for(let i=0; i<el.length; i++) {
            el[i].style.backgroundColor = comp
            el[i].style.color = this.props.stylevars["secondary-color"]
        }
        */
    }

    applyStyle(stylevars) {
        const {
            "background-color": backgroundColor
        } = stylevars

        const bg = stylevars["background-color"]
        const pc = stylevars["primary-color"]
        const sc = stylevars["secondary-color"]
        const ff = stylevars["font-family"]
        const body = document.getElementsByTagName("body")[0]
        body.style.fontFamily = ff
        body.style.backgroundColor = bg
        this.changeBGColor("primary-bg", pc)
        this.changeBGColor("secondary-bg", sc)
        this.changeFontColor("primary-col", pc)
        this.changeFontColor("secondary-col", sc)
    }

    propsDidChange(prevProps) {
        const {
            agency,
            titleMessage,
            displayTime,
            locale
        } = this.props
        if (agency !== prevProps.agency) {
            this.displayAllFuturSessions(agency)
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
            stylevars
        } = this.props
        const listTitle = document.getElementById("list-title")
        listTitle.innerHTML = titleMessage.replace("{agency}", agency)

        this.applyStyle(stylevars)

        if (this.intervalID !== null) {
            window.clearInterval(this.intervalID)
        }
        this.intervalID = window.setInterval(() => this.updateSelection(), displayTime * 1000)
    }
}

const instance = new ZenikaFormations()

Marcel.Debug.changeProps({
    agency: "Nantes",
    titleMessage: "Next formation in {agency}",
    displayTime: 5,
    locale: "fr",
    stylevars: {
        "background-color": "#FFFFFF",
        "primary-color": "rgb(202, 40, 40)", 
        "secondary-color": "rgb(240, 240, 240)", 
        "font-family": "Roboto"
    }
})