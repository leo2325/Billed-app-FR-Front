import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"

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
  // vérifie si data existe.
  // Si data true et/donc sa longueur > 0, la condition est évaluée comme vraie (true)
  
  // Opération de mapping (map): 
  // La méthode map() crée un nouveau tableau avec les résultats de l'appel d'une fonction fournie sur chaque élément du tableau appelant.
  // Si la condition du ternaire est vraie, 
  // la fonction map est utilisée sur le tableau des données. 
  // Cela signifie que pour chaque élément du tableau data, la fonction fléchée (bill => row(bill)) est appliquée. 
  // Cette fonction prend un élément bill du tableau et appelle une fonction appelée row avec bill comme argument.

  // Méthode join("") est ensuite appelée sur le résultat du map. 
  // Cela combine tous les éléments du tableau résultant en une seule chaîne de caractères. 
  // L'argument de la méthode join ("" dans ce cas) spécifie le séparateur entre les éléments dans la chaîne résultante. 
  // En utilisant "", les éléments seront concaténés sans aucun espace entre eux.

  // Valeur de retour: 
  // La valeur de retour de la fonction rows est la chaîne résultante après le join. 
  // Enfin Si la condition du ternaire était fausse (c'est-à-dire si data n'existait pas ou était un tableau vide), 
  // la fonction renvoie une chaîne vide ("").
  

  // En résumé, cette fonction prend un tableau de données (data), 
  // applique une fonction row à chaque élément de ce tableau, 
  // puis concatène les résultats en une seule chaîne de caractères.s
  return (data && data.length) ? data.map(bill => row(bill)).join("") : ""
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