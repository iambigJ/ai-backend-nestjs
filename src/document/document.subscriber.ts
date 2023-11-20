import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
} from 'typeorm';
import { Document } from './entity/document.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventSubscriber()
export class DocumentSubscriber implements EntitySubscriberInterface<Document> {
    constructor(
        dataSource: DataSource,
        private eventEmitter: EventEmitter2,
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return Document;
    }

    async afterUpdate(event: UpdateEvent<Document>): Promise<void> {
        await this.eventEmitter.emitAsync('ocr.progress', event.entity);
    }
}
