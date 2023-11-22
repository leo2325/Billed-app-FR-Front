/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression

    })
    test("Then bills should be ordered from earliest to latest", () => {
      // Contenu HTML du document -> modifié
      // -> injection du contenu généré par la fonction BillsUI -> utilisée pour afficher les notes de frais.
      document.body.innerHTML = BillsUI({ data: bills })
      // dates = tableau dates contenant tous les éléments spécifié
      // utilisation de Regex
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      // antiChrono = Fonction de tri des dates de la plus récente à la plus ancienne.
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      // datesSorted stocke ce trie du tableau dates en utilisant la fonction de comparaison antiChrono 
      // -> le résultat trié est stocké dans le nouveau tableau.
      const datesSorted = [...dates].sort(antiChrono)
      // Si les deux tableaux sont égaux -> test success
      // (signifiant que les dates extraites de l'affichage sont triées de la plus récente à la plus ancienne
      // comme spécifié dans la description du test).
      expect(dates).toEqual(datesSorted)
    })
  })
})
