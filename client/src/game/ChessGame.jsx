import { useState } from "react";

const INITIAL_BOARD = [
  [
    "車",
    "馬",
    "象",
    "士",
    "將",
    "士",
    "象",
    "馬",
    "車",
  ],
  [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ],
  [
    null,
    "砲",
    null,
    null,
    null,
    null,
    null,
    "砲",
    null,
  ],
  [
    "卒",
    null,
    "卒",
    null,
    "卒",
    null,
    "卒",
    null,
    "卒",
  ],
  [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ],
  [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ],
  [
    "兵",
    null,
    "兵",
    null,
    "兵",
    null,
    "兵",
    null,
    "兵",
  ],
  [
    null,
    "炮",
    null,
    null,
    null,
    null,
    null,
    "炮",
    null,
  ],
  [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ],
  [
    "俥",
    "傌",
    "相",
    "仕",
    "帥",
    "仕",
    "相",
    "傌",
    "俥",
  ],
];

const RED_PIECES = [
  "帥",
  "仕",
  "相",
  "俥",
  "傌",
  "炮",
  "兵",
];

const BLACK_PIECES = [
  "將",
  "士",
  "象",
  "車",
  "馬",
  "砲",
  "卒",
];

function isRed(piece) {
  return RED_PIECES.includes(piece);
}

function isBlack(piece) {
  return BLACK_PIECES.includes(piece);
}

function ChessGame() {
  const [board, setBoard] =
    useState(INITIAL_BOARD);

  const [currentPlayer, setCurrentPlayer] =
    useState("RED");

  const [selected, setSelected] =
    useState(null);

  const [winner, setWinner] =
    useState(null);

  // =====================================================
  // KIỂM TRA QUÂN CÓ THUỘC NGƯỜI CHƠI
  // =====================================================

  const isCurrentPlayerPiece = (
    piece
  ) => {
    if (!piece) {
      return false;
    }

    if (currentPlayer === "RED") {
      return isRed(piece);
    }

    return isBlack(piece);
  };

  // =====================================================
  // DI CHUYỂN QUÂN
  //
  // Phiên bản cơ bản:
  // - Xe
  // - Mã
  // - Tượng
  // - Sĩ
  // - Tướng
  // - Pháo
  // - Tốt
  // =====================================================

  const isValidMove = (
    fromRow,
    fromCol,
    toRow,
    toCol
  ) => {
    const piece =
      board[fromRow][fromCol];

    if (!piece) {
      return false;
    }

    const target =
      board[toRow][toCol];

    // Không được ăn quân cùng phe
    if (
      target &&
      isRed(piece) ===
        isRed(target)
    ) {
      return false;
    }

    const rowDiff =
      toRow - fromRow;

    const colDiff =
      toCol - fromCol;

    const absRow =
      Math.abs(rowDiff);

    const absCol =
      Math.abs(colDiff);

    // ---------------------------------------------------
    // XE
    // ---------------------------------------------------

    if (
      piece === "車" ||
      piece === "俥"
    ) {
      if (
        fromRow !== toRow &&
        fromCol !== toCol
      ) {
        return false;
      }

      let count = 0;

      if (fromRow === toRow) {
        const start =
          Math.min(
            fromCol,
            toCol
          );

        const end =
          Math.max(
            fromCol,
            toCol
          );

        for (
          let col = start + 1;
          col < end;
          col++
        ) {
          if (
            board[fromRow][col]
          ) {
            count++;
          }
        }
      } else {
        const start =
          Math.min(
            fromRow,
            toRow
          );

        const end =
          Math.max(
            fromRow,
            toRow
          );

        for (
          let row = start + 1;
          row < end;
          row++
        ) {
          if (
            board[row][fromCol]
          ) {
            count++;
          }
        }
      }

      return count === 0;
    }

    // ---------------------------------------------------
    // MÃ
    // ---------------------------------------------------

    if (
      piece === "馬" ||
      piece === "傌"
    ) {
      if (
        !(
          (absRow === 2 &&
            absCol === 1) ||
          (absRow === 1 &&
            absCol === 2)
        )
      ) {
        return false;
      }

      return true;
    }

    // ---------------------------------------------------
    // TƯỚNG / SĨ
    // ---------------------------------------------------

    if (
      piece === "將" ||
      piece === "帥"
    ) {
      // Tướng đi 1 ô
      if (
        absRow + absCol !== 1
      ) {
        return false;
      }

      // Cung
      if (
        toCol < 3 ||
        toCol > 5
      ) {
        return false;
      }

      if (isRed(piece)) {
        return (
          toRow >= 7 &&
          toRow <= 9
        );
      }

      return (
        toRow >= 0 &&
        toRow <= 2
      );
    }

    if (
      piece === "士" ||
      piece === "仕"
    ) {
      if (
        absRow !== 1 ||
        absCol !== 1
      ) {
        return false;
      }

      if (
        toCol < 3 ||
        toCol > 5
      ) {
        return false;
      }

      if (isRed(piece)) {
        return (
          toRow >= 7 &&
          toRow <= 9
        );
      }

      return (
        toRow >= 0 &&
        toRow <= 2
      );
    }

    // ---------------------------------------------------
    // TƯỢNG
    // ---------------------------------------------------

    if (
      piece === "象" ||
      piece === "相"
    ) {
      if (
        absRow !== 2 ||
        absCol !== 2
      ) {
        return false;
      }

      // Không được qua sông
      if (isRed(piece)) {
        if (toRow < 5) {
          return false;
        }
      } else {
        if (toRow > 4) {
          return false;
        }
      }

      return true;
    }

    // ---------------------------------------------------
    // PHÁO
    // ---------------------------------------------------

    if (
      piece === "砲" ||
      piece === "炮"
    ) {
      if (
        fromRow !== toRow &&
        fromCol !== toCol
      ) {
        return false;
      }

      let count = 0;

      if (fromRow === toRow) {
        const start =
          Math.min(
            fromCol,
            toCol
          );

        const end =
          Math.max(
            fromCol,
            toCol
          );

        for (
          let col = start + 1;
          col < end;
          col++
        ) {
          if (
            board[fromRow][col]
          ) {
            count++;
          }
        }
      } else {
        const start =
          Math.min(
            fromRow,
            toRow
          );

        const end =
          Math.max(
            fromRow,
            toRow
          );

        for (
          let row = start + 1;
          row < end;
          row++
        ) {
          if (
            board[row][fromCol]
          ) {
            count++;
          }
        }
      }

      // Không ăn quân
      if (!target) {
        return count === 0;
      }

      // Ăn quân cần đúng 1 quân chắn
      return count === 1;
    }

    // ---------------------------------------------------
    // TỐT / BINH
    // ---------------------------------------------------

    if (
      piece === "卒" ||
      piece === "兵"
    ) {
      const red =
        isRed(piece);

      // Đi thẳng
      if (
        absCol === 0 &&
        (
          (red &&
            rowDiff === -1) ||
          (!red &&
            rowDiff === 1)
        )
      ) {
        return true;
      }

      // Qua sông mới đi ngang
      const crossedRiver =
        red
          ? fromRow <= 4
          : fromRow >= 5;

      if (
        crossedRiver &&
        absRow === 0 &&
        absCol === 1
      ) {
        return true;
      }

      return false;
    }

    return false;
  };

  // =====================================================
  // CLICK QUÂN
  // =====================================================

  const handleCellClick = (
    row,
    col
  ) => {
    if (winner) {
      return;
    }

    const piece =
      board[row][col];

    // ---------------------------------------------------
    // CHƯA CHỌN QUÂN
    // ---------------------------------------------------

    if (!selected) {
      if (
        piece &&
        isCurrentPlayerPiece(
          piece
        )
      ) {
        setSelected({
          row,
          col,
        });
      }

      return;
    }

    // ---------------------------------------------------
    // CHỌN QUÂN KHÁC CÙNG PHE
    // ---------------------------------------------------

    if (
      piece &&
      isCurrentPlayerPiece(
        piece
      )
    ) {
      setSelected({
        row,
        col,
      });

      return;
    }

    // ---------------------------------------------------
    // DI CHUYỂN
    // ---------------------------------------------------

    if (
      !isValidMove(
        selected.row,
        selected.col,
        row,
        col
      )
    ) {
      setSelected(null);
      return;
    }

    const nextBoard =
      board.map(
        (boardRow) => [
          ...boardRow,
        ]
      );

    const movingPiece =
      nextBoard[
        selected.row
      ][selected.col];

    const capturedPiece =
      nextBoard[row][col];

    nextBoard[
      selected.row
    ][selected.col] = null;

    nextBoard[row][col] =
      movingPiece;

    setBoard(nextBoard);

    setSelected(null);

    // ---------------------------------------------------
    // ĂN TƯỚNG
    // ---------------------------------------------------

    if (
      capturedPiece ===
        "將" ||
      capturedPiece ===
        "帥"
    ) {
      setWinner(
        currentPlayer
      );

      return;
    }

    // ---------------------------------------------------
    // ĐỔI LƯỢT
    // ---------------------------------------------------

    setCurrentPlayer(
      currentPlayer === "RED"
        ? "BLACK"
        : "RED"
    );
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleRestart = () => {
    setBoard(
      INITIAL_BOARD
    );

    setCurrentPlayer(
      "RED"
    );

    setSelected(null);

    setWinner(null);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h1>
        ♟️ Cờ tướng
      </h1>

      {!winner ? (
        <h3>
          Lượt của{" "}
          {currentPlayer ===
          "RED"
            ? "🔴 Đỏ"
            : "⚫ Đen"}
        </h3>
      ) : (
        <h2>
          🎉{" "}
          {winner === "RED"
            ? "🔴 Đỏ"
            : "⚫ Đen"}{" "}
          thắng!
        </h2>
      )}

      {/* =================================================
          BÀN CỜ
      ================================================= */}

      <div
        style={{
          width:
            "min(95vw, 720px)",
          aspectRatio:
            "9 / 10",
          margin: "20px auto",
          display: "grid",
          gridTemplateColumns:
            "repeat(9, 1fr)",
          gridTemplateRows:
            "repeat(10, 1fr)",
          background:
            "#eab676",
          border:
            "4px solid #78350f",
        }}
      >
        {board.map(
          (row, rowIndex) =>
            row.map(
              (
                piece,
                colIndex
              ) => {
                const isSelected =
                  selected?.row ===
                    rowIndex &&
                  selected?.col ===
                    colIndex;

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    type="button"
                    onClick={() =>
                      handleCellClick(
                        rowIndex,
                        colIndex
                      )
                    }
                    style={{
                      position:
                        "relative",
                      padding: 0,
                      border:
                        "1px solid #92400e",
                      backgroundColor:
                        isSelected
                          ? "#fde68a"
                          : "#eab676",
                      cursor:
                        winner
                          ? "default"
                          : "pointer",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    {piece && (
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
                          background:
                            "#fef3c7",
                          border:
                            isRed(
                              piece
                            )
                              ? "2px solid #dc2626"
                              : "2px solid #111",
                          color:
                            isRed(
                              piece
                            )
                              ? "#dc2626"
                              : "#111",
                          fontSize:
                            "clamp(18px, 4vw, 34px)",
                          fontWeight:
                            "bold",
                          boxShadow:
                            "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      >
                        {piece}
                      </span>
                    )}
                  </button>
                );
              }
            )
        )}
      </div>

      {/* =================================================
          HƯỚNG DẪN
      ================================================= */}

      <div
        style={{
          padding: "15px",
          borderRadius:
            "10px",
          background:
            "#f5f5f5",
          textAlign:
            "left",
        }}
      >
        <p>
          🔴 Quân đỏ đi trước.
        </p>

        <p>
          ⚫ Quân đen đi sau.
        </p>

        <p>
          🖱️ Chọn quân rồi chọn
          ô muốn di chuyển.
        </p>

        <p>
          🎯 Có thể ăn quân đối
          phương.
        </p>
      </div>

      {/* =================================================
          CHƠI LẠI
      ================================================= */}

      {winner && (
        <button
          type="button"
          onClick={
            handleRestart
          }
          style={{
            marginTop:
              "20px",
            padding:
              "12px 25px",
            border: "none",
            borderRadius:
              "8px",
            background:
              "#2563eb",
            color: "#fff",
            fontWeight:
              "bold",
            cursor:
              "pointer",
          }}
        >
          🔄 Chơi lại
        </button>
      )}
    </div>
  );
}

export default ChessGame;