import GameUI from "../Engine/GameUI.mjs"
import * as API from "./API.mjs"

export default class BattleRoyaleUI extends GameUI {
  constructor(params) {
    super(params);
    
    this.gamesListGridOptions = {
      columnDefs: [
        {
          headerName: "Name",
          field: "name"
        },
        {
          headerName: "Players",
          field: "numberOfPlayers",
          filter: "agNumberColumnFilter",
          valueFormatter: (params) => params.data.numberOfPlayers + "/" + params.data.maxPlayers
        },
        {
          headerName: "Status",
          field: "status",
          valueGetter: (params) => _.capitalize(params.data.status)
        }
      ],
      rowData: [],
      enableSorting: true,
      enableFilter: true,
      enableColResize: true,
      rowSelection: "single",
      onRowSelected: (event) => this.gamesListRowSelected(event)
    };
    
    this.lobbyListGridOptions = {
      columnDefs: [
        {
          headerName: "Player",
          field: "playerName"
        }
      ],
      rowData: [],
      enableSorting: true,
      enableFilter: true,
      enableColResize: true
    };
  }

  gamesListRowSelected(event) {
    if (event.node.selected && event.data.numberOfPlayers < event.data.maxPlayers && event.data.status === "lobby") {
      $("#join-game").removeAttr("disabled");
    } else if (this.gamesListGridOptions.api.getSelectedRows().length === 0) {
      $("#join-game").attr("disabled", true);
    }
  }

  joinGame() {
    let game = this.gamesListGridOptions.api.getSelectedRows()[0];
    API.joinGame(game.gameId, this.controller.player)
      .done((game) => {
        this.controller.joinGame(game);
        this.transition("LOBBY");
      });
  }

  listGames() {
    if (!this.gamesListGridOptions.api) {
      this.gameListGrid = new agGrid.Grid($("#games-list")[0], this.gamesListGridOptions);
    }
    API.listGames()
      .done((games) => {
        this.gamesListGridOptions.api.setRowData(games);
      });
  }

  showLobby() {
    if (!this.lobbyListGridOptions.api) {
      this.lobbyListGrid = new agGrid.Grid($("#lobby-list")[0], this.lobbyListGridOptions);
    }
    API.getLobby(this.controller.gameInfo.gameId)
      .done((game) => {
        this.lobbyListGridOptions.api.setRowData(game.players);
      });
  }

  showScores(scores) {
  }
}
