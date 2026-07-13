import discord
from discord.ext import commands
import os

# Konfigurasi izin akses (intents)
intents = discord.Intents.default()
intents.message_content = True
intents.members = True 

# Inisialisasi bot dengan prefix !
bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'Bot moderasi siap: {bot.user.name}')

# --- FITUR 1: WELCOMER ---
@bot.event
async def on_member_join(member):
    # Bot akan mencari channel bernama 'welcome-goodbye'
    channel = discord.utils.get(member.guild.text_channels, name='welcome-goodbye')
    if channel:
        await channel.send(f'Halo {member.mention}, selamat datang di server **{member.guild.name}**! 🎉 Jangan lupa baca peraturan ya!')

# --- FITUR 2: COMMAND KICK ---
@bot.command()
@commands.has_permissions(kick_members=True)
async def kick(ctx, member: discord.Member, *, reason=None):
    try:
        await member.kick(reason=reason)
        await ctx.send(f'✅ {member.mention} berhasil ditendang. Alasan: {reason}')
    except Exception as e:
        await ctx.send(f'❌ Gagal menendang. Pastikan posisi role bot lebih tinggi dari target.')

@kick.error
async def kick_error(ctx, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send('❌ Anda tidak memiliki izin (`Kick Members`) untuk menggunakan perintah ini.')

# --- FITUR 3: COMMAND ROLE ---
@bot.command()
@commands.has_permissions(manage_roles=True)
async def addrole(ctx, member: discord.Member, role: discord.Role):
    try:
        await member.add_roles(role)
        await ctx.send(f'✅ Role **{role.name}** berhasil diberikan kepada {member.mention}.')
    except Exception as e:
        await ctx.send(f'❌ Gagal memberikan role. Periksa posisi role bot.')

@bot.command()
@commands.has_permissions(manage_roles=True)
async def removerole(ctx, member: discord.Member, role: discord.Role):
    try:
        await member.remove_roles(role)
        await ctx.send(f'✅ Role **{role.name}** berhasil dihapus dari {member.mention}.')
    except Exception as e:
        await ctx.send(f'❌ Gagal menghapus role.')

# Tetap biarkan teks 'TOKEN' ini di dalam kode main.py Anda
bot.run(os.environ['TOKEN'])
