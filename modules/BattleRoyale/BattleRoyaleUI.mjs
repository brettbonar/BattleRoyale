import GameUI from "../Engine/GameUI.mjs"
import * as API from "./API.mjs"
import { EVENTS, defaultKeyBindings, keyBindings, eventsOrder } from "./controls.mjs"
import KEY_CODES from "../util/keyCodes.mjs"

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
          valueGetter: (params) => _.startCase(params.data.status)
        }
      ],
      rowData: [],
      enableSorting: true,
      enableFilter: true,
      enableColResize: true,
      rowSelection: "single",
      onRowSelected: (event) => this.gamesListRowSelected(event),
      onRowDoubleClicked: (event) => {
        if (event.data.status === "lobby") {
          if (event.data.numberOfPlayers < event.data.maxPlayers) {
            this.joinGame();  
          } else {
            this.menus.JOIN_GAME.find("#join-notification")
              .removeClass("success")
              .addClass("error")
              .html("Game is full");
          }
        } else {
          this.menus.JOIN_GAME.find("#join-notification")
            .removeClass("success")
            .addClass("error")
            .html("Game in progress");
        }
      }
    };
    
    this.lobbyListGridOptions = {
      columnDefs: [
        {
          headerName: "Player",
          field: "playerName"
        },
        {
          headerName: "Status",
          field: "status",
          valueGetter: (params) => _.startCase(params.data.status)
        }
      ],
      rowData: [],
      enableSorting: true,
      enableFilter: true,
      enableColResize: true
    };
  }

  initControls() {
    if (!this.keyBindingsInit) {
      this.keyBindingsInit = true;
      let controls = $("#control-settings");
      for (const event of eventsOrder) {
        let keyValue = parseInt(keyBindings[event], 10);
        if (!_.isNaN(keyValue)) {
          keyValue = _.startCase(_.findKey(KEY_CODES, (val) => val === keyValue));
        } else {
          keyValue = _.startCase(event);
        }

        controls.append("<label for='" + event + "'>" + _.startCase(event) + "</label>");
        let input = $("<input id='" + event + "'/>");
        controls.append(input);
        input.val(keyValue);

        let selectHandler = () => {
          let keyHandler = (inputEvent) => {
            keyBindings[event] = inputEvent.keyCode;
            input.val(_.startCase(_.findKey(KEY_CODES, (val) => val === inputEvent.keyCode)));
            input.blur();
            window.removeEventListener("keydown", keyHandler);
            window.removeEventListener("mousedown", mouseHandler);
          };
          let mouseHandler = (inputEvent) => {
            if (inputEvent.button === 0) {
              keyBindings[event] = "leftClick";
              input.val("Left Click");
              input.blur();
              window.removeEventListener("keydown", keyHandler);
              window.removeEventListener("mousedown", mouseHandler);
            } else if (inputEvent.button === 2) {
              keyBindings[event] = "rightClick";
              input.val("Right Click");
              input.blur();
              window.removeEventListener("keydown", keyHandler);
              window.removeEventListener("mousedown", mouseHandler);
            }
          };
          window.addEventListener("keydown", keyHandler);
          window.addEventListener("mousedown", mouseHandler);
        }

        input.focus(selectHandler);
      }
    }
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
      })
      .fail((response) => {
        this.menus.JOIN_GAME.find("#join-notification")
          .removeClass("success")
          .addClass("error")
          .html(response.responseText);
      });
  }
  
  createGame() {
    let game = {
      name: this.menus.CREATE_GAME.find("#name").val(),
      mapSize: this.menus.CREATE_GAME.find("#mapSize").val(),
      maxPlayers: this.menus.CREATE_GAME.find("#maxPlayers").val(),
      biomes: {
        plain: this.menus.CREATE_GAME.find("#plain").val(),
        forest: this.menus.CREATE_GAME.find("#forest").val(),
        desert: this.menus.CREATE_GAME.find("#desert").val()
      }
    };
    API.createGame(game)
      .done((gameId) => {
        API.joinGame(gameId, this.controller.player)
          .done((game) => {
            this.controller.joinGame(game);
            this.transition("LOBBY");
          });
      })
      .fail((response) => {
        this.menus.CREATE_GAME.find("#create-notification")
          .removeClass("success")
          .addClass("error")
          .html(response.responseText);
      });
  }

  listGames() {
    if (!this.gamesListGridOptions.api) {
      this.gameListGrid = new agGrid.Grid($("#games-list")[0], this.gamesListGridOptions);
    }
    $("#join-game").attr("disabled", true);
    API.listGames()
      .done((games) => {
        this.gamesListGridOptions.api.setRowData(games);
      });
  }

  updateLobby(lobby) {
    if (!this.lobbyListGridOptions.api) {
      this.lobbyListGrid = new agGrid.Grid($("#lobby-list")[0], this.lobbyListGridOptions);
    }
    this.lobbyListGridOptions.api.setRowData(lobby.players);
  }

  showLobby() {
    if (!this.lobbyListGridOptions.api) {
      this.lobbyListGrid = new agGrid.Grid($("#lobby-list")[0], this.lobbyListGridOptions);
    }
    API.getLobby(this.controller.gameInfo.gameId)
      .done((lobby) => {
        this.updateLobby(lobby);
      });
  }

  onShowRegister() {
    this.menus.REGISTER.find("#registerUsername").focus();
  }

  onShowLogin() {
    this.menus.LOGIN.find("#loginUsername").focus();
  }

  onShowCreate() {
    this.menus.CREATE_GAME.find("#name").focus();
  }

  buildRow(data) {
    return "<tr>" + data.map((item) => "<td>" + item + "</td>").join("") + "</tr>";
  }

  showLeaderboard() {
    API.getScores()
      .done((scores) => {
        let leaderboardList = this.menus.LEADERBOARD.find("#leaderboard-list");
        leaderboardList.find("tr:gt(0)").remove();
        scores = _.sortBy(scores, "wins", "kills").reverse();
        
        for (const score of scores) {
          leaderboardList.append(this.buildRow([score.playerName, score.wins, score.kills]));
        }
      });
  }

  showScoreboard(scores) {
    let remaining = this.menus.SCOREBOARD.find("#players-remaining");
    remaining.html(scores.filter((score) => score.status === "alive").length);
    let scoreboardList = this.menus.SCOREBOARD.find("#scoreboard-list");
    scoreboardList.find("tr:gt(0)").remove();
    scores = _.sortBy(scores, (score) => score.status === "alive", "kills").reverse();
    
    for (const score of scores) {
      scoreboardList.append(this.buildRow([score.playerName, score.kills, _.startCase(score.status)]));
    }
  }
}
