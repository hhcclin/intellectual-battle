import {
  useEffect,
  useState,
} from "react";

import { io } from "socket.io-client";

const SERVER_URL =
  "http://localhost:5000";

const BOARD_SIZE = 15;

// =====================================================
// TẠO BÀN CỜ TRỐNG
// =====================================================

function createEmptyBoard() {
  return Array.from(
    {
      length: BOARD_SIZE,
    },
    () =>
      Array(
        BOARD_SIZE
      ).fill(null)
  );
}

// =====================================================
// CARO MULTIPLAYER
// =====================================================

function CaroGame({
  room,
  playerId,
}) {
  // ===================================================
  // STATE
  // ===================================================

  const [socket, setSocket] =
    useState(null);

  const [board, setBoard] =
    useState(
      createEmptyBoard()
    );

  const [
    currentPlayer,
    setCurrentPlayer,
  ] = useState("X");

  const [winner, setWinner] =
    useState(null);

  const [moveCount, setMoveCount] =
    useState(0);

  const [myPlayer, setMyPlayer] =
    useState(null);

  const [connected, setConnected] =
    useState(false);

  // ===================================================
  // ROOM ID
  // ===================================================

  const roomId = room?.id;

  // ===================================================
  // XÁC ĐỊNH X / O
  // ===================================================

  useEffect(() => {
    if (
      !room ||
      !playerId ||
      !Array.isArray(
        room.players
      )
    ) {
      return;
    }

    const player =
      room.players.find(
        (item) =>
          item.id ===
          playerId
      );

    if (!player) {
      return;
    }

    setMyPlayer(player);
  }, [
    room,
    playerId,
  ]);

  // ===================================================
  // KẾT NỐI SOCKET.IO
  // ===================================================

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const newSocket =
      io(SERVER_URL, {
        transports: [
          "websocket",
          "polling",
        ],
      });

    setSocket(newSocket);

    // -------------------------------------------------
    // CONNECT
    // -------------------------------------------------

    newSocket.on(
      "connect",
      () => {
        console.log(
          "Caro socket connected:",
          newSocket.id
        );

        setConnected(true);

        // ---------------------------------------------
        // Vào Socket.IO room
        // ---------------------------------------------

        newSocket.emit(
          "joinRoom",
          {
            roomId,
          }
        );
      }
    );

    // -------------------------------------------------
    // CARO STATE
    // -------------------------------------------------

    newSocket.on(
      "caroState",
      (game) => {
        if (!game) {
          return;
        }

        setBoard(
          game.board ||
            createEmptyBoard()
        );

        setCurrentPlayer(
          game.currentPlayer ||
            "X"
        );

        setWinner(
          game.winner ||
            null
        );

        setMoveCount(
          game.moveCount ||
            0
        );
      }
    );

    // -------------------------------------------------
    // DISCONNECT
    // -------------------------------------------------

    newSocket.on(
      "disconnect",
      () => {
        console.log(
          "Caro socket disconnected"
        );

        setConnected(false);
      }
    );

    // -------------------------------------------------
    // CLEANUP
    // -------------------------------------------------

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  // ===================================================
  // KIỂM TRA CÓ PHẢI LƯỢT CỦA MÌNH
  // ===================================================

  const mySymbol =
    myPlayer?.seat === 1
      ? "X"
      : myPlayer?.seat === 2
        ? "O"
        : null;

  const isMyTurn =
    mySymbol ===
    currentPlayer;

  // ===================================================
  // CLICK Ô CỜ
  // ===================================================

  const handleCellClick = (
    row,
    col
  ) => {
    // -----------------------------------------------
    // Chưa kết nối
    // -----------------------------------------------

    if (!socket || !connected) {
      return;
    }

    // -----------------------------------------------
    // Chưa xác định người chơi
    // -----------------------------------------------

    if (!mySymbol) {
      return;
    }

    // -----------------------------------------------
    // Không phải lượt mình
    // -----------------------------------------------

    if (!isMyTurn) {
      return;
    }

    // -----------------------------------------------
    // Game đã kết thúc
    // -----------------------------------------------

    if (winner) {
      return;
    }

    // -----------------------------------------------
    // Ô đã có quân
    // -----------------------------------------------

    if (
      board[row][col]
    ) {
      return;
    }

    // -----------------------------------------------
    // Gửi nước đi lên server
    // -----------------------------------------------

    socket.emit(
      "caroMove",
      {
        roomId,
        row,
        col,
        player: mySymbol,
      }
    );
  };

  // ===================================================
  // CHƠI LẠI
  // ===================================================

  const handleRestart = () => {
    if (!socket) {
      return;
    }

    socket.emit(
      "caroRestart",
      {
        roomId,
      }
    );
  };

  // ===================================================
  // CHỜ NGƯỜI CHƠI
  // ===================================================

  const playerCount =
    Array.isArray(
      room?.players
    )
      ? room.players.length
      : 0;

  const maxPlayers =
    room?.maxPlayers || 2;

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "850px",
        margin: "0 auto",
        padding: "20px",
        boxSizing:
          "border-box",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            marginBottom: "10px",
          }}
        >
          🎮 Cờ caro
        </h1>

        <p>
          👥 Người chơi:{" "}
          <strong>
            {playerCount} /{" "}
            {maxPlayers}
          </strong>
        </p>

        {/* -----------------------------------------------
            SOCKET
        ----------------------------------------------- */}

        <p
          style={{
            fontSize: "14px",
            color: connected
              ? "#16a34a"
              : "#dc2626",
          }}
        >
          {connected
            ? "🟢 Đã kết nối máy chủ"
            : "🔴 Đang kết nối máy chủ..."}
        </p>

        {/* -----------------------------------------------
            CHỜ NGƯỜI CHƠI
        ----------------------------------------------- */}

        {playerCount <
          2 && (
          <div
            style={{
              padding: "12px",
              marginTop: "15px",
              borderRadius:
                "10px",
              background:
                "#fff7ed",
              border:
                "1px solid #fed7aa",
              color: "#9a3412",
              fontWeight:
                "bold",
            }}
          >
            ⏳ Chờ người chơi
            khác tham gia...
          </div>
        )}

        {/* -----------------------------------------------
            NGƯỜI CHƠI CỦA MÌNH
        ----------------------------------------------- */}

        {mySymbol && (
          <div
            style={{
              marginTop: "12px",
              fontSize: "18px",
              fontWeight:
                "bold",
            }}
          >
            Bạn là{" "}
            <span
              style={{
                color:
                  mySymbol === "X"
                    ? "#dc2626"
                    : "#2563eb",
              }}
            >
              {mySymbol}
            </span>
          </div>
        )}

        {/* -----------------------------------------------
            TRẠNG THÁI LƯỢT
        ----------------------------------------------- */}

        {playerCount >=
          2 &&
          !winner && (
            <h3
              style={{
                marginTop: "12px",
              }}
            >
              {isMyTurn ? (
                <span
                  style={{
                    color:
                      "#16a34a",
                  }}
                >
                  🎯 Đến lượt
                  bạn
                </span>
              ) : (
                <span
                  style={{
                    color:
                      "#6b7280",
                  }}
                >
                  ⏳ Chờ đối thủ
                  đi...
                </span>
              )}
            </h3>
          )}

        {/* -----------------------------------------------
            THẮNG
        ----------------------------------------------- */}

        {winner ===
          "DRAW" && (
          <h2
            style={{
              color:
                "#d97706",
            }}
          >
            🤝 Ván đấu hòa!
          </h2>
        )}

        {winner &&
          winner !==
            "DRAW" && (
            <h2
              style={{
                color:
                  winner ===
                  mySymbol
                    ? "#16a34a"
                    : "#dc2626",
              }}
            >
              {winner ===
              mySymbol
                ? "🎉 Bạn thắng!"
                : "😔 Bạn thua!"}
            </h2>
          )}
      </div>

      {/* =================================================
          BÀN CỜ
      ================================================= */}

      <div
        style={{
          width: "100%",
          overflowX:
            "auto",
          padding: "10px",
          boxSizing:
            "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            width: "min(90vw, 750px)",
            minWidth: "500px",
            aspectRatio:
              "1 / 1",
            margin:
              "0 auto",
            backgroundColor:
              "#f5d6a1",
            border:
              "3px solid #78350f",
            boxSizing:
              "border-box",
          }}
        >
          {board.map(
            (
              row,
              rowIndex
            ) =>
              row.map(
                (
                  cell,
                  colIndex
                ) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    type="button"
                    onClick={() =>
                      handleCellClick(
                        rowIndex,
                        colIndex
                      )
                    }
                    disabled={
                      Boolean(
                        cell
                      ) ||
                      Boolean(
                        winner
                      ) ||
                      !isMyTurn ||
                      playerCount <
                        2 ||
                      !connected
                    }
                    style={{
                      padding: 0,
                      margin: 0,
                      border:
                        "1px solid #92400e",
                      backgroundColor:
                        "#f5d6a1",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      minWidth: 0,
                      minHeight: 0,

                      cursor:
                        cell ||
                        winner ||
                        !isMyTurn ||
                        playerCount <
                          2
                          ? "default"
                          : "pointer",
                    }}
                  >
                    {cell && (
                      <span
                        style={{
                          width:
                            "75%",
                          height:
                            "75%",
                          borderRadius:
                            "50%",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          backgroundColor:
                            cell ===
                            "X"
                              ? "#111827"
                              : "#ffffff",
                          color:
                            cell ===
                            "X"
                              ? "#ffffff"
                              : "#111827",
                          border:
                            cell ===
                            "O"
                              ? "2px solid #374151"
                              : "none",
                          fontSize:
                            "clamp(10px, 2.5vw, 24px)",
                          fontWeight:
                            "bold",
                          boxSizing:
                            "border-box",
                        }}
                      >
                        {cell}
                      </span>
                    )}
                  </button>
                )
              )
          )}
        </div>
      </div>

      {/* =================================================
          THÔNG TIN
      ================================================= */}

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          borderRadius:
            "10px",
          backgroundColor:
            "#f5f5f5",
          textAlign:
            "center",
          border:
            "1px solid #ddd",
        }}
      >
        <p
          style={{
            margin:
              "6px 0",
          }}
        >
          ⚫ Người chơi X:
          đi trước
        </p>

        <p
          style={{
            margin:
              "6px 0",
          }}
        >
          ⚪ Người chơi O:
          đi sau
        </p>

        <p
          style={{
            margin:
              "6px 0",
          }}
        >
          🏆 Nối được 5
          quân liên tiếp
          sẽ thắng.
        </p>

        <p
          style={{
            margin:
              "6px 0",
            color: "#666",
          }}
        >
          Số nước đã đi:{" "}
          {moveCount}
        </p>
      </div>

      {/* =================================================
          CHƠI LẠI
      ================================================= */}

      {winner && (
        <div
          style={{
            textAlign:
              "center",
            marginTop: "20px",
          }}
        >
          <button
            type="button"
            onClick={
              handleRestart
            }
            style={{
              marginTop:
                "10px",
              padding:
                "12px 25px",
              border: "none",
              borderRadius:
                "8px",
              backgroundColor:
                "#2563eb",
              color:
                "#ffffff",
              fontWeight:
                "bold",
              fontSize:
                "16px",
              cursor:
                "pointer",
            }}
          >
            🔄 Chơi lại
          </button>
        </div>
      )}
    </div>
  );
}

export default CaroGame;