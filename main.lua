local Fluent = loadstring(game:HttpGet("https://github.com/dawid-scripts/Fluent/releases/latest/download/main.lua"))()

-- [[ 1. TỰ ĐỘNG VÀO TEAM ]]
pcall(function()
    if game:GetService("Players").LocalPlayer.Team == nil then
        game:GetService("ReplicatedStorage").Remotes.CommF_:InvokeServer("SetTeam", "Pirates") 
    end
end)

-- [[ KHỞI TẠO WINDOW ]]
local Window = Fluent:CreateWindow({
    Title = "Danhvux Hub | Blox Fruit",
    SubTitle = "Bản Test",
    TabWidth = 160,
    Size = UDim2.fromOffset(580, 620), 
    Acrylic = true,
    Theme = "Dark"
})

-- [[ BIẾN ĐIỀU KHIỂN ]]
_G.TweenSpeed = 250 
_G.WalkOnWater = true  
_G.AutoStoreFruit = false 
_G.AutoFruitHunter = false 
_G.ESP_Player = false
_G.ESP_Fruit = false
_G.ESP_Boss = false
_G.Tracers = false
local StartTime = os.time()

local Tabs = {
    Status = Window:AddTab({ Title = "Status", Icon = "info" }),
    Teleport = Window:AddTab({ Title = "Teleport", Icon = "map-pin" }),
    ESP = Window:AddTab({ Title = "ESP", Icon = "eye" }),
    Fruit = Window:AddTab({ Title = "Fruit", Icon = "apple" }),
    Shop = Window:AddTab({ Title = "Shop", Icon = "shopping-cart" }),
    Settings = Window:AddTab({ Title = "Settings", Icon = "settings" })
}

-- [[ PHẦN STATUS ]]
local ServerTimeSection = Tabs.Status:AddParagraph({ Title = "⏳ Uptime", Content = "00:00:00" })
local MoonSection = Tabs.Status:AddParagraph({ Title = "🌕 Moon Progress", Content = "Đang tính..." })
local GachaSection = Tabs.Status:AddParagraph({ Title = "🕒 Gacha Next", Content = "Đang kiểm tra..." })
local EliteSection = Tabs.Status:AddParagraph({ Title = "⚔️ Elite Hunter", Content = "Đang kiểm tra..." })
local MirageSection = Tabs.Status:AddParagraph({ Title = "🏝️ Mirage Island", Content = "Chưa có" })

-- [[ HÀM TWEEN ]]
local TweenService = game:GetService("TweenService")
local CurrentTween = nil
function TweenTo(targetCFrame)
    local char = game.Players.LocalPlayer.Character
    local root = char and char:FindFirstChild("HumanoidRootPart")
    if not root then return end
    local distance = (targetCFrame.Position - root.Position).Magnitude
    if distance < 10 then if CurrentTween then CurrentTween:Cancel() end root.CFrame = targetCFrame return end
    if CurrentTween then CurrentTween:Cancel() end
    CurrentTween = TweenService:Create(root, TweenInfo.new(distance/_G.TweenSpeed, Enum.EasingStyle.Linear), {CFrame = targetCFrame})
    CurrentTween:Play()
end

-- [[ HÀM TẠO ESP & TRACER ]]
local Camera = workspace.CurrentCamera
function CreateESP(target, name, color)
    local bgui = target:FindFirstChild("DvxESP") or Instance.new("BillboardGui", target)
    bgui.Name = "DvxESP"; bgui.AlwaysOnTop = true; bgui.Size = UDim2.new(0, 200, 0, 50); bgui.ExtentsOffset = Vector3.new(0, 3, 0)
    local nametag = bgui:FindFirstChild("Tag") or Instance.new("TextLabel", bgui)
    nametag.Name = "Tag"; nametag.Size = UDim2.new(1, 0, 1, 0); nametag.BackgroundTransparency = 1; nametag.TextColor3 = color; nametag.TextSize = 14; nametag.Font = Enum.Font.SourceSansBold; nametag.Text = name
    
    if _G.Tracers then
        local line = target:FindFirstChild("DvxTracer") or Instance.new("LineHandleAdornment", target)
        line.Name = "DvxTracer"; line.Length = (target.Position - Camera.CFrame.Position).Magnitude; line.CFrame = CFrame.lookAt(Vector3.new(0,0,0), target.Position - Camera.CFrame.Position); line.Color3 = color; line.Thickness = 2; line.AlwaysOnTop = true; line.Adornee = target
    elseif target:FindFirstChild("DvxTracer") then target.DvxTracer:Destroy() end
end

-- [[ VÒNG LẶP CẬP NHẬT CHÍNH ]]
spawn(function()
    while task.wait(0.5) do
        local diff = os.time() - StartTime
        ServerTimeSection:SetDesc(string.format("%02d:%02d:%02d", math.floor(diff/3600), math.floor((diff%3600)/60), diff%60))
        
        pcall(function()
            local moon = game:GetService("Lighting"):GetAttribute("MoonProgress")
            if moon then MoonSection:SetDesc(math.floor(moon*100) >= 100 and "🌕 FULL MOON!" or "🌒 "..math.floor(moon*100).."%") end
            MirageSection:SetDesc(workspace:FindFirstChild("Mirage Island") and "⚠️ ĐÃ CÓ!" or "Chưa có")
            
            if diff % 10 == 0 then
                local gachaRes = game:GetService("ReplicatedStorage").Remotes.CommF_:InvokeServer("Cousin", "Buy")
                if type(gachaRes) == "string" and string.find(gachaRes, "wait") then GachaSection:SetDesc(gachaRes:match("%d+ hours?, %d+ minutes?, %d+ seconds?") or gachaRes) end
                local eliteMsg = game:GetService("ReplicatedStorage").Remotes.CommF_:InvokeServer("ElitePirateProgress")
                EliteSection:SetDesc((type(eliteMsg) == "string" and eliteMsg ~= "") and eliteMsg or "Đang hồi chiêu")
            end
        end)

        -- ESP Player (Tên + Máu)
        for _, p in pairs(game.Players:GetPlayers()) do
            if p ~= game.Players.LocalPlayer and p.Character and p.Character:FindFirstChild("HumanoidRootPart") then
                if _G.ESP_Player then
                    local info = p.Name .. " [" .. math.floor(p.Character.Humanoid.Health) .. "]"
                    CreateESP(p.Character.HumanoidRootPart, info, Color3.fromRGB(0, 255, 255))
                elseif p.Character.HumanoidRootPart:FindFirstChild("DvxESP") then p.Character.HumanoidRootPart.DvxESP:Destroy() end
            end
        end
    end
end)

-- [[ TAB TELEPORT ]]
Tabs.Teleport:AddSection("🏝️ Sea 3 Islands")
local Locations = {["Mansion"] = CFrame.new(-12463, 332, -7549), ["Floating Turtle"] = CFrame.new(-13274, 531, -7583), ["Hydra Island"] = CFrame.new(5744, 601, -282), ["Castle"] = CFrame.new(-5075, 314, -3151)}
for name, cf in pairs(Locations) do
    Tabs.Teleport:AddButton({Title = "Đến " .. name, Callback = function() TweenTo(cf) end})
end

-- [[ TAB FRUIT ]]
Tabs.Fruit:AddToggle("AutoFruit", {Title = "Auto Fruit Hunter", Default = false}):OnChanged(function(v) _G.AutoFruitHunter = v end)
Tabs.Fruit:AddToggle("AutoStore", {Title = "Auto Store Fruit", Default = false}):OnChanged(function(v) _G.AutoStoreFruit = v end)
spawn(function()
    while task.wait(1) do
        if _G.AutoFruitHunter then
            for _, v in pairs(workspace:GetChildren()) do
                if v:IsA("Tool") and v:FindFirstChild("Handle") and (string.find(v.Name, "Fruit") or v:FindFirstChild("Fruit")) then
                    TweenTo(v.Handle.CFrame)
                end
            end
        end
        if _G.AutoStoreFruit then
            for _, v in pairs(game.Players.LocalPlayer.Backpack:GetChildren()) do
                if v:IsA("Tool") and (string.find(v.Name, "Fruit") or v:FindFirstChild("Fruit")) then
                    game:GetService("ReplicatedStorage").Remotes.CommF_:InvokeServer("StoreFruit", v.Name, v)
                end
            end
        end
    end
end)

-- [[ TAB SHOP - RESET STATS & MELEE ]]
Tabs.Shop:AddSection("📊 Stats Management")
Tabs.Shop:AddButton({
    Title = "Reset Stats (2500 Frags)",
    Callback = function()
        local res = game:GetService("ReplicatedStorage").Remotes.CommF_:InvokeServer("BlackbeardReward", "Refund", "Buy")
        if res ~= "Success" then game:GetService("ReplicatedStorage").Remotes.CommF_:InvokeServer("RefundPoints") end
        Fluent:Notify({Title = "Hệ thống", Content = "Đã thực hiện Reset Stats!"})
    end
})
Tabs.Shop:AddSection("🥋 Melee Style")
local Melees = {["Godhuman"]="BuyGodhuman", ["Superhuman"]="BuySuperhuman", ["Death Step"]="BuyDeathStep", ["Sharkman Karate"]="BuySharkmanKarate"}
for name, remote in pairs(Melees) do
    Tabs.Shop:AddButton({Title = "Học " .. name, Callback = function() game:GetService("ReplicatedStorage").Remotes.CommF_:InvokeServer(remote) end})
end

-- [[ SETTINGS ]]
Tabs.ESP:AddToggle("ESPPlayer", {Title = "Hiện Player", Default = false}):OnChanged(function(v) _G.ESP_Player = v end)
Tabs.ESP:AddToggle("Tracers", {Title = "Bật Tracer", Default = false}):OnChanged(function(v) _G.Tracers = v end)
Tabs.Settings:AddSlider("TweenSpeed", {Title = "Tốc độ bay", Default = 250, Min = 100, Max = 500, Rounding = 0, Callback = function(v) _G.TweenSpeed = v end})
Tabs.Settings:AddToggle("WalkWater", {Title = "Đứng trên mặt nước", Default = true}):OnChanged(function(v) _G.WalkOnWater = v end)

spawn(function()
    local WaterPart = Instance.new("Part", workspace)
    WaterPart.Size, WaterPart.Transparency, WaterPart.Anchored = Vector3.new(10000, 1, 10000), 1, true
    while task.wait() do
        WaterPart.CanCollide = _G.WalkOnWater
        local root = game.Players.LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
        if root and _G.WalkOnWater then WaterPart.CFrame = CFrame.new(root.Position.X, 10, root.Position.Z) end
    end
end)

Window:SelectTab(1)
Fluent:Notify({Title = "Danhvux Hub", Content = "Script Loaded Successfully!", Duration = 5})
