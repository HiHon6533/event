package com.eventbooking.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class HoldTicketRequest {
    private List<Long> ticketIds;
}
