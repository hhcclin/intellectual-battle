const API = "http://localhost:5000/api";

// =====================================================
// LẤY DANH SÁCH PHÒNG
// =====================================================

export async function getRooms() {
  const response = await fetch(`${API}/rooms`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Không thể lấy danh sách phòng."
    );
  }

  return data;
}

// =====================================================
// LẤY MỘT PHÒNG
// =====================================================

export async function getRoom(roomId) {
  const response = await fetch(
    `${API}/rooms/${roomId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Không thể tải phòng."
    );
  }

  return data;
}

// =====================================================
// TẠO PHÒNG
// =====================================================

export async function createRoom(room) {
  const response = await fetch(`${API}/rooms`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(room),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Không thể tạo phòng."
    );
  }

  return data;
}

// =====================================================
// THAM GIA PHÒNG
// =====================================================

export async function joinRoom(
  roomId,
  playerName
) {
  const response = await fetch(
    `${API}/rooms/${roomId}/join`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: playerName,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Không thể tham gia phòng."
    );
  }

  return data;
}

// =====================================================
// BẮT ĐẦU GAME
// =====================================================

export async function startRoom(
  roomId,
  playerId
) {
  const response = await fetch(
    `${API}/rooms/${roomId}/start`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        playerId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Không thể bắt đầu game."
    );
  }

  return data;
}

// =====================================================
// KÍCH NGƯỜI CHƠI
// =====================================================

export async function kickPlayer(
  roomId,
  targetPlayerId,
  playerId
) {
  const response = await fetch(
    `${API}/rooms/${roomId}/players/${targetPlayerId}`,
    {
      method: "DELETE",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        playerId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Không thể kích người chơi."
    );
  }

  return data;
}

// =====================================================
// KHÓA / MỞ GHẾ
// =====================================================

export async function toggleSeat(
  roomId,
  seat,
  playerId
) {
  const response = await fetch(
    `${API}/rooms/${roomId}/seats/${seat}/toggle`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        playerId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Không thể khóa/mở ghế."
    );
  }

  return data;
}