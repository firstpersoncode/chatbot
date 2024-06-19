import {
  Box,
  Button,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, MouseEvent, useEffect, useState } from "react";
import { IChat, fetchChats, getAnswer, postChat } from "@/services/chat";

export default function ChatRoom({
  roomId,
  fileId,
}: {
  roomId: number;
  fileId: number;
}) {
  const [message, setMessage] = useState<string>("");
  const [chats, setChats] = useState<IChat[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) =>
    setMessage(e.target.value);

  const onSubmitInput = async (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (!message) return;
    let currChats = [...chats];
    try {
      setSubmitting(true);
      const chat = await postChat({
        role: "user",
        room: roomId,
        message,
      });

      setMessage("");
      currChats.push(chat);

      const answer = await getAnswer(chat, fileId);
      currChats.push(answer);

      setChats(currChats);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        if (typeof roomId !== "undefined") {
          const chats = await fetchChats(roomId);
          setChats(chats);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [roomId]);

  return (
    <>
      <Stack sx={{ gap: 2, mb: 2 }}>
        {chats.map((chat, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              justifyContent: chat.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <Box
              sx={{
                minWidth: "250px",
                maxWidth: "1000px",
                p: 2,
                border: "1px solid #555",
                borderRadius: (theme) => theme.spacing(2),
              }}
            >
              <Typography
                sx={{
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                  mb: 2,
                  display: "block",
                }}
              >
                {chat.message}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      {submitting && <LinearProgress />}

      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={10}
        value={message}
        label="Write Something ..."
        onChange={onChangeInput}
        sx={{ mb: 2 }}
      />

      <Button
        fullWidth
        type="submit"
        variant="contained"
        onClick={onSubmitInput}
        disabled={submitting}
      >
        <Typography>Send</Typography>
      </Button>
    </>
  );
}
