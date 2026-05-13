var builder = DistributedApplication.CreateBuilder(args);

var sql = builder.AddSqlServer("sql")
    .AddDatabase("AppDb");

builder.AddProject<Projects.WebApi>("webapi")
    .WithReference(sql)
    .WaitFor(sql);

builder.AddNpmApp("frontend", "../../frontend", "start")
    .WithHttpEndpoint(port: 4200, isProxied: false)
    .WithExternalHttpEndpoints();

builder.Build().Run();
