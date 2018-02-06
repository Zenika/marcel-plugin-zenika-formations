class ZenikaFormations extends Marcel.Plugin {
    constructor() {
        super({
            defaultProps: {
                agency: '',
                titleMessage: "Next formation in {agency}",
                displayTime: 1
            },
        })
        
        this.formationList = document.getElementById('content')
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
        })
    }

    displayList() {
        while (this.formationList.firstChild) {
            this.formationList.removeChild(this.formationList.firstChild);
        }
        this.sessionList.forEach((e, i) => {
            const formation = document.createElement("li")
            if(i === this.selectedIndex) {
                formation.classList.add("selected")
            }
            formation.innerHTML = "Formation " + e.trainingTitle + ", " + e.trainingSubTitle + " | " + 
            e.startDate + " at " + e.agencyName
            this.formationList.appendChild(formation)
        })
    }
    
    updateSelection() {
        if(this.sessionList !== undefined && this.sessionList.length !== 0) {
            if(this.selectedIndex === this.sessionList.length) {
                this.selectedIndex = 0
            } else {
                this.selectedIndex += 1
            }
            this.displayList()
        }
    }
    
    propsDidChange(prevProps) {
        const { agency, titleMessage, displayTime } = this.props
        if (agency !== prevProps.agency) {
            this.displayAllFuturSessions(agency)
        }
    }
    
    render() {
        const { agency, titleMessage, displayTime } = this.props
        const listTitle = document.getElementById("list-title")
        listTitle.innerHTML = titleMessage.replace("{agency}", agency)

        if(this.intervalID !== null) {
            window.clearInterval(this.intervalID)
        }
        this.intervalID = window.setInterval(a => this.updateSelection(), displayTime*1000)
    }
}

const instance = new ZenikaFormations()

Marcel.Debug.changeProps({ agency: "Nantes", titleMessage: "Next formation in {agency}", displayTime: 1 })