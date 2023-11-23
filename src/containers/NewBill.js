import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  // méthode qui réagit à l’événement de changement de fichier et effectue plusieurs opérations :
  handleChangeFile = e => {
    e.preventDefault()
    // file stocke la recherche de la valeur de la recherche entré par l’utilisateur
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    // filePath cible la valeur de l’élément cliqué 
    // en utilisant une expression régulière afin de récupérer une partie du chemin
    const filePath = e.target.value.split(/\\/g)
    // fileName extrait le nom du fichier à partir du tableau filePath, 
    // cela permet de récupérer le nom du fichier lui-même
    const fileName = filePath[filePath.length-1]
    // formData stocke un objet FormData qui permet de construire facilement des paires clé-valeur 
    // pour être envoyées dans le corps d'une requête HTTP
    const formData = new FormData()
    // email, récupère l'adresse de l'utilisateur à partir du localStorage, 
    // analysée à l'aide de JSON.parse pour extraire la propriété "email".
    const email = JSON.parse(localStorage.getItem("user")).email
    // ajoute le fichier et l’adresse mail récupéré à l'objet formData 
    // sous les noms de clé « file" et « email ».
    formData.append('file', file)
    formData.append('email', email)

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
  }
  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}