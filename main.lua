-- [[ 1. TỰ ĐỘNG VÀO TEAM ]]
pcall(function()
    if game:GetService("Players").LocalPlayer.Team == nil then
        game:GetService("ReplicatedStorage").Remotes.CommF_:InvokeServer("SetTeam", "Pirates") 
    end
end)

local Fluent = loadstring(game:HttpGet("https://github.com/dawid-scripts/Fluent/releases/latest/download/main.lua"))()
local Window = Fluent:CreateWindow({
    Title = "Status Server | Blox Fruit",
    SubTitle = "Danhvux - Pro Hunter v11 (Teleport Edition)",
    TabWidth = 160,
    Size = UDim2.fromOffset(580, 620), 
    Acrylic = true,
    Theme = "Dark"
})

-- [[ BIẾN ĐIỀU KHIỂN ]]
_G.TweenSpeed = 250 
_G.WalkOnWater = true  
_G.ESP_Player = false
_G.Tracers = false
local StartTime = os.time()

local Tabs = {
    Status = Window:AddTab({ Title = "Status", Icon = "info" }),
    Teleport = Window:AddTab({ Title = "Teleport", Icon = "map-pin" }), -- Tab Teleport Mới
    ESP = Window:AddTab({ Title = "ESP", Icon = "eye" }),
    Fruit = Window:AddTab({ Title = "Fruit", Icon = "apple" }),
    Shop = Window:AddTab({ Title = "Shop", Icon = "shopping-cart" }),
    Settings = Window:AddTab({ Title = "Settings", Icon = "settings" })
}

-- [[ HÀM TWEEN TO ]]
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

-- [[ TAB TELEPORT ]]
Tabs.Teleport:AddSection("🏝️ Các đảo chính (Sea 3)")
local Locations = {
    ["Mansion (Dinh thự)"] = CFrame.new(-12463, 332, -7549),
    ["Floating Turtle (Đảo Rùa)"] = CFrame.new(-13274, 531, -7583),
    ["Hydra Island (Đảo Nữ Nhân)"] = CFrame.new(5744, 601, -282),
    ["Castle on the Sea (Lâu đài trên biển)"] = CFrame.new(-5075, 314, -3151),
    ["Port Town (Thị trấn cảng)"] = CFrame.new(-780, 15, 5543),
    ["Sea of Treats (Biển bánh kẹo)"] = CFrame.new(-1500, 50, -13000)
}

for name, cf in pairs(Locations) do
    Tabs.Teleport:AddButton({
        Title = "Đến: " .. name,
        Callback = function() TweenTo(cf) end
    })
end

Tabs.Teleport:AddSection("🌊 Đổi Sea (Thế giới)")
Tabs.Teleport:AddButton({
    Title = "Sang Sea 1",
    Callback = function() game:GetService("ReplicatedStorage").Remotes.CommF_:InvokeServer("TravelMain") end
})
Tabs.Teleport:AddButton({
    Title = "Sang Sea 2",
    Callback = function() game:GetService("ReplicatedStorage").Remotes.CommF_:InvokeServer("TravelDressrosa") end
})
Tabs.Teleport:AddButton({
    Title = "Sang Sea 3",
    Callback = function() game:GetService("ReplicatedStorage").Remotes.CommF_:InvokeServer("TravelZou") end
})

-- [[ TAB SHOP - RESET STATS & MELEE ]]
Tabs.Shop:AddSection("📊 Quản lý Stats")
Tabs.Shop:AddButton({
    Title = "Reset Stats (2500 Frags)",
    Callback = function()
        local response = game:GetService("ReplicatedStorage").Remotes.CommF_:InvokeServer("BlackbeardReward", "Refund", "Buy")
        if response ~= "Success" then game:GetService("ReplicatedStorage").Remotes.CommF_:InvokeServer("RefundPoints") end
        Fluent:Notify({Title = "Thông báo", Content = "Đã thực hiện Reset Stats!"})
    end
})

Tabs.Shop:AddSection("🥋 Melee Style")
local Melees = {["Godhuman"]="BuyGodhuman", ["Superhuman"]="BuySuperhuman", ["Death Step"]="BuyDeathStep", ["Sharkman Karate"]="BuySharkmanKarate", ["Electric Claw"]="BuyElectricClaw", ["Dragon Talon"]="BuyDragonTalon"}
for name, remote in pairs(Melees) do
    Tabs.Shop:AddButton({
        Title = "Học: " .. name,
        Callback = function() game:GetService("ReplicatedStorage").Remotes.CommF_:InvokeServer(remote) end
    })
end

-- [[ STATUS & ESP (GIỮ NGUYÊN) ]]
local ServerTimeSection = Tabs.Status:AddParagraph({ Title = "⏳ Server Time", Content = "00:00:00" })
local MoonSection = Tabs.Status:AddParagraph({ Title = "🌕 Mặt trăng", Content = "..." })

spawn(function()
    while task.wait(0.5) do
        local diff = os.time() - StartTime
        ServerTimeSection:SetDesc(string.format("%02d:%02d:%02d", math.floor(diff/3600), math.floor((diff%3600)/60), diff%60))
        
        local moon = game:GetService("Lighting"):GetAttribute("MoonProgress")
        if moon then MoonSection:SetDesc(math.floor(moon*100) >= 100 and "🌕 FULL MOON!" or "🌒 Độ tròn: "..math.floor(moon*100).."%") end

        if _G.ESP_Player then
            for _, p in pairs(game.Players:GetPlayers()) do
                if p ~= game.Players.LocalPlayer and p.Character and p.Character:FindFirstChild("HumanoidRootPart") then
                    local target = p.Character.HumanoidRootPart
                    local bgui = target:FindFirstChild("DvxESP") or Instance.new("BillboardGui", target)
                    bgui.Name = "DvxESP"; bgui.AlwaysOnTop = true; bgui.Size = UDim2.new(0, 200, 0, 50); bgui.ExtentsOffset = Vector3.new(0, 3, 0)
                    local nametag = bgui:FindFirstChild("Tag") or Instance.new("TextLabel", bgui)
                    nametag.Name = "Tag"; nametag.Size = UDim2.new(1, 0, 1, 0); nametag.BackgroundTransparency = 1; nametag.TextColor3 = Color3.fromRGB(0, 255, 255); nametag.TextSize = 14; nametag.Font = Enum.Font.SourceSansBold; nametag.Text = p.Name .. "\nHP: " .. math.floor(p.Character.Humanoid.Health)
                end
            end
        end
    end
end)

-- [[ SETTINGS ]]
Tabs.Settings:AddSlider("TweenSpeed", { Title = "Tốc độ bay", Default = 250, Min = 100, Max = 500, Rounding = 0, Callback = function(v) _G.TweenSpeed = v end })
Tabs.Settings:AddToggle("WalkWater", {Title = "Đứng trên mặt nước", Default = true }):OnChanged(function(v) _G.WalkOnWater = v end)
Tabs.ESP:AddToggle("ESPPlayer", {Title = "Hiện Player", Default = false}):OnChanged(function(v) _G.ESP_Player = v end)

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
