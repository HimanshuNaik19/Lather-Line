package com.latherline.service.notification;

import com.latherline.entity.Order;

public interface NotificationService {
    void sendOrderStatusNotification(Order order);
}
