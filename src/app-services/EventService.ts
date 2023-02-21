import { injectable } from "inversify";
import { IEventService } from "./interfaces";
import Event, { EventModelInterface } from "@app-repositories/models/Event";

@injectable()
class EventService implements IEventService {
  async createEvent(_event: EventModelInterface): Promise<EventModelInterface> {
    const event = await Event.create({
      schema: _event.schema,
      action: _event.action,
      schemaId: _event.schemaId,
      actor: _event.actor,
      description: _event.description,
    });

    return event;
  }
}

export default EventService;
