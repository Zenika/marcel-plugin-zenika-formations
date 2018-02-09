/* Use to debug the plugin:
Marcel.Debug.changeProps({
    agency: "Nantes",
    titleMessage: "Next formation in {agency}",
    displayTime: 5,
    locale: "fr",
    dualpane: true,
    headerColor: "rgba(222, 33, 33, 0.85)",
    selectedColor: "rgba(222, 33, 33, 0.85)",
    stylevars: {
        "background-color": "#FFFFFF",
        "primary-color": "rgba(248, 211, 211, 1)", 
        "secondary-color": "rgba(237, 18, 18, 0.5)", 
        "font-family": "Roboto"
    }
})
*/

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
        this.hasPrev = false
        this.urlFormationList = "http://localhost:8080/api/public/planned-sessions"
        this.intervalID = null
        
        this.bgIsDark = false
        this.selectedIsDark = false
        this.headerIsDark = false
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
                if (dualpane) {
                    this.displaySessionDetail()
                    this.updateSelection()
                }
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
        const desc = document.createElement("div")
        desc.innerHTML = session.training.description
        summary.innerHTML = desc.innerText
    }
    
    displayList() {
        this.formationList.innerHTML = ""
        this.sessionList.forEach((formation, index) => {
            const item = document.createElement("div")
            item.classList.add("flex-container")
            item.classList.add("list-item")
            if(index === 0) {
                item.classList.add("top")
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
            this.displaySessionDetail()
            this.updateSelectionColor()
            this.hasPrev = true
            if (this.selectedIndex === this.sessionList.length - 1) {
                this.selectedIndex = 0
            } else {
                this.selectedIndex += 1
            }
        }
    }
    
    removeSelectionColor() {
        const prevIndex = this.selectedIndex == 0 ? this.formationList.children.length-1 : this.selectedIndex-1
        const prevItem = this.formationList.children[prevIndex]
        prevItem.classList.remove("selected")
        if (this.bgIsDark) {
            for(let i=0; i<prevItem.children.length; ++i) {
                prevItem.children[i].classList.add("dark")
            }
        } else {
            for(let i=0; i<prevItem.children.length; ++i) {
                prevItem.children[i].classList.remove("dark")
            }
        }
    }
    
    updateSelectionColor() {
        if (this.hasPrev)
            this.removeSelectionColor()
        const item = this.formationList.children[this.selectedIndex]
        item.classList.add("selected")
        if (this.selectedIsDark) {
            for(let i=0; i<item.children.length; ++i) {
                item.children[i].classList.add("dark")
            }
        } else {
            for(let i=0; i<item.children.length; ++i) {
                item.children[i].classList.remove("dark")
            }
        }
    }
    
    propsDidChange(prevProps) {
        const {
            agency,
            titleMessage,
            displayTime,
            locale,
            dualpane,
            selectedColor,
            headerColor,
            stylevars
        } = this.props
        
        if (agency !== prevProps.agency) {
            this.displayAllFuturSessions(agency, dualpane)
        }
        if (locale !== prevProps.locale) {
            moment.locale(locale)
        }
        
        this.bgIsDark = tinycolor(stylevars["background-color"]).isDark()
        this.selectedIsDark = tinycolor(selectedColor).isDark()
        this.headerIsDark = tinycolor(headerColor).isDark()
        if(this.headerIsDark) {
            const headers = document.getElementsByClassName("title-block")
            for (const h of headers) {
                h.classList.add("dark")
            }
        } else {
            const headers = document.getElementsByClassName("title-block")
            for (const h of headers) {
                h.classList.remove("dark")
            }
        }

        const html = document.getElementsByTagName("html")[0]
        html.style.setProperty("--header-color", headerColor)
        html.style.setProperty("--highlight-color", selectedColor)

        const primaryColor = tinycolor(stylevars["primary-color"])
        html.style.setProperty("--primary-text-color", 
            primaryColor.isDark() ? primaryColor.toHexString() : primaryColor.darken(60).toHexString())
        html.style.setProperty("--primary-text-color-dark", 
            primaryColor.isLight() ? primaryColor.toHexString() : primaryColor.lighten(60).toHexString())

        const secondaryColor = tinycolor(stylevars["secondary-color"])
        html.style.setProperty("--secondary-text-color", 
            secondaryColor.isDark() ? secondaryColor.toHexString() : secondaryColor.darken(60).toHexString())
        html.style.setProperty("--secondary-text-color-dark", 
            secondaryColor.isLight() ? secondaryColor.toHexString() : secondaryColor.lighten(60).toHexString())
    }
    
    render() {
        const {
            agency,
            titleMessage,
            displayTime,
            locale,
            dualpane,
            selectedColor,
            headerColor,
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
