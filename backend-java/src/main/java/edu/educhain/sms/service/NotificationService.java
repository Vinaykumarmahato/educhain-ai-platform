package edu.educhain.sms.service;

import edu.educhain.sms.model.Notification;
import edu.educhain.sms.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> findByRecipient(String username) {
        return notificationRepository.findByRecipientUsernameOrderByTimestampDesc(username);
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public Notification save(Notification notification) {
        return notificationRepository.save(notification);
    }
}
