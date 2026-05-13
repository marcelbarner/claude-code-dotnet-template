var builder = DistributedApplication.CreateBuilder(args);

var sql = builder.AddSqlServer("sql")
    .AddDatabase("AppDb");

builder.AddProject<Projects.WebApi>("webapi")
    .WithReference(sql)
    .WaitFor(sql);

builder.Build().Run();
