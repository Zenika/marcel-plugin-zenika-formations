class ZenikaFormations extends Marcel.Plugin {
    constructor() {
        super({
            defaultProps: {
                agency: ''
            },
        })
        
        this.formationList = document.getElementById('content');
        this.urlFormationList = "http://localhost:8080/api/public/planned-sessions"
    }
    
    getAllSessionsInAgency(agency) {
        return fetch(this.urlFormationList)
        .then(response => response.json())
        .then(formJson => formJson.plannedSessions.filter(e => e.agencyName === agency))
    }
    
    displayAllFuturSessions(agency) {
        this.getAllSessionsInAgency(agency)
        .then(sessions => {
            sessions.forEach(e => {
                const formation = document.createElement("li")
                formation.innerHTML = "Formation " + e.trainingTitle + ", " + e.trainingSubTitle + " | " + 
                e.startDate + " at " + e.agencyName
                this.formationList.appendChild(formation)
            })
        })
    }
    
    createSessionBox(session) {
        
    }
    
    propsDidChange(prevProps) {
        const { agency } = this.props
        if (agency !== prevProps.agency) {
            this.displayAllFuturSessions(agency)
        }
    }
    
    render() {
        const { agency } = this.props
    }
}

const instance = new ZenikaFormations()

Marcel.Debug.changeProps({agency: "Nantes"})