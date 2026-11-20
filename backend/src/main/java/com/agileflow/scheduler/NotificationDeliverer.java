package com.agileflow.scheduler;

import com.agileflow.entity.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Delivery channel abstraction. The default implementation logs the notification; replace with an
 * email/Slack/web-push sender. Any exception thrown triggers the retry mechanism in NotificationProcessor.
 * Must only use scalar fields of the notification (it runs outside a transaction).
 */
@Component
public class NotificationDeliverer {
    private static final Logger log = LoggerFactory.getLogger(NotificationDeliverer.class);

    public void deliver(Notification n) {
        log.info("Delivered notification #{} [{}]: {}", n.getId(), n.getType(), n.getMessage());
    }
}
