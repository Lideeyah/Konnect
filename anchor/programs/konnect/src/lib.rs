use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, SetAuthority, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod konnect {
    use super::*;

    pub fn initialize_marketplace(ctx: Context<InitializeMarketplace>, name: String) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.authority = ctx.accounts.authority.key();
        marketplace.name = name;
        marketplace.escrow_count = 0;
        Ok(())
    }

    pub fn init_escrow(ctx: Context<InitEscrow>, amount: u64, delivery_code_hash: String) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        escrow.buyer = ctx.accounts.buyer.key();
        escrow.seller = ctx.accounts.seller.key();
        escrow.amount = amount;
        escrow.delivery_code_hash = delivery_code_hash;
        escrow.status = EscrowStatus::Locked;
        escrow.bump = *ctx.bumps.get("escrow").unwrap();

        // Transfer funds to escrow PDA
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        Ok(())
    }

    pub fn release_escrow(ctx: Context<ReleaseEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == EscrowStatus::Locked, ErrorCode::EscrowNotLocked);

        // Transfer funds to seller
        let seeds = &[
            b"escrow",
            escrow.buyer.as_ref(),
            escrow.seller.as_ref(),
            &[escrow.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, escrow.amount)?;

        // Close escrow account (optional, or just mark released)
        escrow.status = EscrowStatus::Released;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeMarketplace<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 4 + name.len() + 8)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitEscrow<'info> {
    #[account(init, payer = buyer, space = 8 + 32 + 32 + 8 + 64 + 1 + 1, seeds = [b"escrow", buyer.key().as_ref(), seller.key().as_ref()], bump)]
    pub escrow: Account<'info, Escrow>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: Seller account
    pub seller: AccountInfo<'info>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(init, payer = buyer, token::mint = mint, token::authority = escrow, seeds = [b"token_seed", escrow.key().as_ref()], bump)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ReleaseEscrow<'info> {
    #[account(mut, seeds = [b"escrow", escrow.buyer.as_ref(), escrow.seller.as_ref()], bump = escrow.bump)]
    pub escrow: Account<'info, Escrow>,
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"token_seed", escrow.key().as_ref()], bump)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Marketplace {
    pub authority: Pubkey,
    pub name: String,
    pub escrow_count: u64,
}

#[account]
pub struct Escrow {
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub amount: u64,
    pub delivery_code_hash: String,
    pub status: EscrowStatus,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowStatus {
    Locked,
    Released,
    Cancelled,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Escrow is not in a locked state.")]
    EscrowNotLocked,
}
