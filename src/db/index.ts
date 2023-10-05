import { Database } from 'bun:sqlite'

export interface Room {
  id: string
  created_at: Date
}

export interface Message {
  id: string
  room_id: string
  role: 'system' | 'user' | 'assistant' | 'function'
  content: string
  created_at: Date
}

export function connect(name?: string) {
  const db = new Database(name)

  // create tables
  db.query(
    `CREATE TABLE IF NOT EXISTS rooms (
      id CHAR(21) PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  ).run()

  db.query(
    `CREATE TABLE IF NOT EXISTS messages (
      id CHAR(21) PRIMARY KEY,
      room_id CHAR(21),
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    )`,
  ).run()

  // create prepared statements
  const createRoom = db.query<Room, { $id: string }>(
    'INSERT INTO rooms (id) VALUES ($id)',
  )

  const getRoom = db.query<Room, { $id: string }>(
    'SELECT * FROM rooms WHERE id = $id',
  )

  const getRoomMessages = db.query<
    { role: 'system' | 'user' | 'assistant' | 'function'; content: string },
    { $roomId: string }
  >('SELECT role, content FROM messages WHERE room_id = $roomId')

  const getMessage = db.query<Message, { $id: string }>(
    'SELECT * FROM messages WHERE id = $id',
  )

  const insertMessage = db.query<
    Message,
    { $id: string; $roomId: string; $role: string; $content: string }
  >(
    `INSERT INTO messages (id, room_id, role, content) VALUES (
      $id, $roomId, $role, $content
    )`,
  )

  const updateMessage = db.query<Message, { $id: string; $content: string }>(
    `UPDATE messages
    SET content = $content
    WHERE id = $id`,
  )

  return {
    db,
    createRoom,
    getRoom,
    getRoomMessages,
    getMessage,
    insertMessage,
    updateMessage,
  }
}
