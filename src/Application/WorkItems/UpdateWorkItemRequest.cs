using Domain.WorkItems;

namespace Application.WorkItems;

public sealed record UpdateWorkItemRequest(
    string Title,
    string? Description,
    WorkItemStatus Status);
