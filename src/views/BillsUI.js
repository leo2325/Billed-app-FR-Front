import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"
import {formatDate} from "../app/format.js"
import Actions from './Actions.js'

const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `)
  }

  const rows = (data) => {
    // Tri des données (data.sort(...)): La principale modification apportée à la fonction 
    // est l'ajout d'une étape de tri des données avant le traitement ultérieur. 
    // Le tableau data est trié en fonction de la date de chaque élément, du plus récent au plus ancien, 
    // en utilisant la méthode sort avec une fonction de comparaison.
    // Cette fonction de comparaison utilise les objets Date pour comparer les dates des éléments. 
    // Si la date de l'élément a est antérieure à celle de l'élément b, 
    // la fonction retourne 1 (ce qui signifie que b doit être placé avant a dans le tableau trié), 
    // sinon elle retourne -1.

    // Modification de la valeur de retour: 
    // (Au lieu de retourner directement le résultat de l'opération map et join sur le tableau og data) 
    // la fonction retourne le résultat de ces opérations appliquées sur l' array trié result. 
    // Si result n'est pas un tableau par ex, si data est null ou undefined, la fonction retourne une chaîne vide ("").

    const result = (data && data.length) ? data.sort((a,b) => new Date(a.date) < new Date(b.date) ? 1 : -1 ) : [];
    return Array.isArray(result) ? result.map(bill => row(bill)).join("") : "";
  }
  

export default ({ data: bills, loading, error }) => {
  
  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }
  
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
  )
}