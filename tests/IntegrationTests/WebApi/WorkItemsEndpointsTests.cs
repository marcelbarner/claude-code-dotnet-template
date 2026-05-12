using System.Net;
using System.Net.Http.Json;
using Application.WorkItems;
using Domain.WorkItems;
using FluentAssertions;
using IntegrationTests.Infrastructure;
using WebApi.Contracts;

namespace IntegrationTests.WebApi;

public sealed class WorkItemsEndpointsTests(TestWebApplicationFactory factory) : IClassFixture<TestWebApplicationFactory>
{
    [Fact]
    public async Task CreateAsync_ShouldReturnCreated_WhenPayloadIsValid()
    {
        factory.EnsureDatabaseCreated();
        HttpClient client = factory.CreateClient();
        CreateWorkItemHttpRequest request = new()
        {
            Title = "Seed template",
            Description = "Exercise starter path"
        };

        HttpResponseMessage response = await client.PostAsJsonAsync("/api/v1/work-items", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();
    }

    [Fact]
    public async Task GetAsync_ShouldReturnNotFound_WhenResourceDoesNotExist()
    {
        factory.EnsureDatabaseCreated();
        HttpClient client = factory.CreateClient();

        HttpResponseMessage response = await client.GetAsync($"/api/v1/work-items/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnOk_WhenPayloadIsValid()
    {
        factory.EnsureDatabaseCreated();
        HttpClient client = factory.CreateClient();

        // Create a work item first
        CreateWorkItemHttpRequest createRequest = new()
        {
            Title = "Original title",
            Description = "Original description"
        };
        HttpResponseMessage createResponse = await client.PostAsJsonAsync("/api/v1/work-items", createRequest);
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        WorkItemDto? created = await createResponse.Content.ReadFromJsonAsync<WorkItemDto>();
        created.Should().NotBeNull();

        // Update it
        UpdateWorkItemHttpRequest updateRequest = new()
        {
            Title = "Updated title",
            Description = "Updated description",
            Status = WorkItemStatus.Completed
        };
        HttpResponseMessage updateResponse = await client.PutAsJsonAsync($"/api/v1/work-items/{created!.Id}", updateRequest);

        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        WorkItemDto? updated = await updateResponse.Content.ReadFromJsonAsync<WorkItemDto>();
        updated.Should().NotBeNull();
        updated!.Title.Should().Be("Updated title");
        updated.Description.Should().Be("Updated description");
        updated.Status.Should().Be(WorkItemStatus.Completed);
    }

    [Fact]
    public async Task UpdateAsync_ShouldReturnNotFound_WhenWorkItemDoesNotExist()
    {
        factory.EnsureDatabaseCreated();
        HttpClient client = factory.CreateClient();

        UpdateWorkItemHttpRequest request = new()
        {
            Title = "Doesn't matter",
            Status = WorkItemStatus.Active
        };

        HttpResponseMessage response = await client.PutAsJsonAsync($"/api/v1/work-items/{Guid.NewGuid()}", request);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
