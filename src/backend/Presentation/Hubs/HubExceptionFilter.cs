using Microsoft.AspNetCore.SignalR;
using Application.Exceptions;
using Core.Exceptions;

namespace Presentation.Hubs;

public class HubExceptionFilter : IHubFilter
{
    public async ValueTask<object?> InvokeMethodAsync(HubInvocationContext invocationContext, Func<HubInvocationContext, ValueTask<object?>> next)
    {
        try
        {
            return await next(invocationContext);
        }
        catch (CoreLogicException ex) { throw new HubException(ex.Message); }
        catch (ArgumentException ex) { throw new HubException(ex.Message); }
        catch (InvalidOperationException ex) { throw new HubException(ex.Message); }
        catch (NotFoundException ex) { throw new HubException(ex.Message); }
        catch (UserDeletedException ex) { throw new HubException(ex.Message); }
        catch (ConflictException ex) { throw new HubException(ex.Message); }
        catch (Exception ex) { throw new HubException(ex.Message); }
    }
}