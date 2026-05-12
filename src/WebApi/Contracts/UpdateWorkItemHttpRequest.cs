using System.ComponentModel.DataAnnotations;
using Domain.WorkItems;

namespace WebApi.Contracts;

public sealed class UpdateWorkItemHttpRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; init; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; init; }

    public WorkItemStatus Status { get; init; }
}
