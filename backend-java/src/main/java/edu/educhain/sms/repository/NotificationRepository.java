package edu.educhain.sms.repository;

import edu.educhain.sms.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUsernameOrderByTimestampDesc(String username);
}
