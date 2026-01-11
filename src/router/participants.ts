import { Hono } from "hono";
import { prisma } from "../utils/prisma.js";
import { zValidator } from "@hono/zod-validator";
import {
  createParticipatValidation,
  participantParamValidation,
  updateParticipantValidation,
  getParticipantsQueryValidation,
} from "../validation/participant-validation.js";
import { bodyLimit } from "hono/body-limit";

export const participantsRoute = new Hono()
  .get("/", zValidator("query", getParticipantsQueryValidation), async (c) => {
    try {
      const { eventId } = c.req.valid("query");

      const participants = await prisma.participant.findMany({
        where: {
          eventId,
        },
      });
      return c.json({ data: participants });
    } catch (error) {
      console.error("Failed to list participants", error);
      return c.json({ message: "Failed to retrieve participants" }, 500);
    }
  })
  .post("/", zValidator("json", createParticipatValidation), async (c) => {
    try {
      const body = c.req.valid("json");
      const event = await prisma.event.findUnique({
        where: {
          id: body.eventId,
        },
      });
      if (!event) {
        return c.json({ message: "Event not found" }, 404);
      }
      const newParticipant = await prisma.participant.create({
        data: {
          name: body.name,
          email: body.email,
          eventId: body.eventId,
        },
      });
      return c.json({
        data: newParticipant,
        message: "Participant Created Successfully",
      });
    } catch (error) {
      console.error("Failed to Create Participant", error);
      return c.json({ message: "Failed to create participant" }, 500);
    }
  })
  .patch(
    "/:id",
    zValidator("param", participantParamValidation),
    zValidator("json", updateParticipantValidation),
    async (c) => {
      const { id } = c.req.valid("param");
      try {
        const body = c.req.valid("json");
        const existingParticipants = await prisma.participant.findUnique({
          where: {
            id,
          },
        });
        if (!existingParticipants) {
          return c.json({ message: "Participant Not Found" }, 404);
        }

        const event = await prisma.event.findUnique({
          where: {
            id: body.eventId,
          },
        });

        if (!event) {
          return c.json({ message: "Event Not Found" }, 404);
        }

        const updateParticipant = await prisma.participant.update({
          where: {
            id,
          },
          data: {
            name: body.name,
            email: body.email,
            eventId: body.eventId,
          },
        });
        return c.json({
          data: updateParticipant,
          message: "Participant Updated Successfully",
        });
      } catch (error) {
        console.error(`Failed to update participant with id=${id}`, error);
        return c.json({ message: "Failed to Update Participant" }, 500);
      }
    }
  )
  .delete("/:id", zValidator("param", participantParamValidation), async (c) => {
    const { id } = c.req.valid("param");
    try {
      const existingParticipants = await prisma.participant.findUnique({
        where: {
          id,
        },
      });
      if (!existingParticipants) {
        return c.json({ message: "Participant not Found" }, 404);
      }

      await prisma.participant.delete({
        where: {
          id,
        },
      });
      return c.json({ message: "Participant Deleted Successfully" });
    } catch (error) {
      console.error(`Failed to delete participant with id=${id}`, error);
      return c.json({ message: "Failed to Delete Participant" }, 500);
    }
  });
