class ZenikaFormations extends Marcel.Plugin {
    constructor() {
        super({
            defaultProps: {
                agency: "",
                titleMessage: "Next formation in {agency}",
                displayTime: 1
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
        const [title, subtitle, trainer, date, summary] = [
            document.getElementById("title"),
            document.getElementById("subtitle"),
            document.getElementById("trainer"),
            document.getElementById("date"),
            document.getElementById("summary")
        ]
        const session = this.sessionList[this.selectedIndex]
        title.innerHTML = session.trainingTitle
        subtitle.innerHTML = session.trainingSubTitle
        if(session.trainerFirstName !== null && session.trainerLastName !== null) {
            trainer.innerHTML = session.trainerFirstName + " " + session.trainerLastName
        }
        const endDate = new Date(session.startDate)
        endDate.setDate(endDate.getDate() + session.trainingDays)
        date.innerHTML = session.startDate + " - " + endDate.getFullYear() + "-" + endDate.getMonth() + "-" + endDate.getDay()
        summary.innerHTML = session.training.description
    }

    displayList() {
        while (this.formationList.firstChild) {
            this.formationList.removeChild(this.formationList.firstChild)
        }
        this.sessionList.forEach((e, i) => {
            const formation = document.createElement("li")
            if (i === this.selectedIndex) {
                formation.classList.add("selected")
            }
            formation.innerHTML = e.startDate + ": " + e.trainingTitle
            this.formationList.appendChild(formation)
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

    propsDidChange(prevProps) {
        const {
            agency,
            titleMessage,
            displayTime
        } = this.props
        if (agency !== prevProps.agency) {
            this.displayAllFuturSessions(agency)
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
    }

    applyStyle(stylevars) {
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
    stylevars: {
        "background-color": "#FFFFFF",
        "primary-color": "rgb(202, 40, 40)", 
        "secondary-color": "rgb(240, 240, 240)", 
        "font-family": "Roboto"
    }
})